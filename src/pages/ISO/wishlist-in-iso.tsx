import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fetchEnglishWishlist, buildEnglishWishlistCards, getWishlistIdentity, getWishlistVariants } from "./catalog-adapter";
export function useWishlist() {
 const [wishlist,setWishlist]=useState<Set<string>>(new Set());
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [pendingCards,setPendingCards]=useState<Set<string>>(new Set());
 const wishlistRef=useRef<Set<string>>(new Set());
 const pending=useRef(new Set<string>());
 const activeUser=useRef("");
 const alive=useRef(false);
 const request=useRef(0);
 const revision=useRef(0);
 const load=useCallback(async()=>{
  const ticket=++request.current;const version=revision.current;
  try {
   const {data,error:authError}=await supabase.auth.getSession();
   if(!alive.current||ticket!==request.current)return;
   if(authError){if(alive.current)setError(authError.message);throw authError;}
   const id=data.session?.user.id??"";
   if(activeUser.current!==id){activeUser.current=id;wishlistRef.current=new Set();setWishlist(new Set());}
   if(!id){setError("");return;}
   const result=await fetchEnglishWishlist(id);if(result.error)throw result.error;
   if(!alive.current||ticket!==request.current||activeUser.current!==id||version!==revision.current||pending.current.size)return;
   const next=new Set(buildEnglishWishlistCards(result.data??[]).map(card=>getWishlistIdentity(card.set_id,card.card_key)));
   wishlistRef.current=next;setWishlist(next);setError("");
  }catch(cause){if(alive.current&&ticket===request.current)setError(cause instanceof Error?cause.message:"Your wishlist could not be loaded. Please retry.");}
  finally{if(alive.current&&ticket===request.current)setLoading(false);}
 },[]);
 useEffect(()=>{
  alive.current=true;let timer:ReturnType<typeof setTimeout>|undefined;
  const reload=()=>{void load();};
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
   const id=session?.user.id??"";
   if(id!==activeUser.current){++request.current;++revision.current;activeUser.current=id;wishlistRef.current=new Set();pending.current.clear();setWishlist(new Set());setPendingCards(new Set());setLoading(true);setError("");clearTimeout(timer);timer=setTimeout(reload,0);}
  });
  window.addEventListener("focus",reload);window.addEventListener("iso-wishlist-changed",reload);void load();
  return()=>{alive.current=false;++request.current;clearTimeout(timer);subscription.unsubscribe();window.removeEventListener("focus",reload);window.removeEventListener("iso-wishlist-changed",reload);};
 },[load]);
 const toggleWishlist=async(setId:string,cardKey:string)=>{
  const {data,error:authError}=await supabase.auth.getSession();
  if(authError){if(alive.current)setError(authError.message);throw authError;}
  const id=data.session?.user.id;
  if(!id){const failure=new Error("Sign in to update your wishlist.");if(alive.current)setError(failure.message);throw failure;}
  if(!alive.current||activeUser.current!==id){const failure=new Error("Your account changed. Reload your wishlist and try again.");if(alive.current)setError(failure.message);throw failure;}
  const identity=getWishlistIdentity(setId,cardKey);if(pending.current.has(identity))return;
  pending.current.add(identity);++revision.current;setPendingCards(new Set(pending.current));setError("");
  const removed=wishlistRef.current.has(identity);
  try{
   const result=removed?await supabase.from("wishlists").delete().eq("user_id",id).in("card_key",getWishlistVariants(setId,cardKey)):await supabase.from("wishlists").upsert({user_id:id,card_key:identity},{onConflict:"user_id,card_key",ignoreDuplicates:true});
   if(result.error)throw result.error;
   if(!alive.current||activeUser.current!==id)return;
   const next=new Set(wishlistRef.current);if(removed)next.delete(identity);else next.add(identity);wishlistRef.current=next;setWishlist(next);
   pending.current.delete(identity);++revision.current;
   window.dispatchEvent(new CustomEvent("iso-wishlist-changed",{detail:{userId:id,setId,cardKey,removed}}));
  }catch(cause){if(alive.current&&activeUser.current===id)setError(cause instanceof Error?cause.message:"Your wishlist could not be updated. Please retry.");throw cause;}
  finally{if(activeUser.current===id){pending.current.delete(identity);if(alive.current)setPendingCards(new Set(pending.current));}}
 };
 return {wishlist,toggleWishlist,loading,error,pendingCards,retry:load};
}
