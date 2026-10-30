import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
const englishSets=new Set(["/moon-one","/moon-two","/moon-three","/moon-four","/star-one","/rainbow-one","/rainbow-two","/fun-moments-one","/fun-moments-two","/fun-moments-three","/fun-moments-four","/fantasy-wonderland","/friendships-begin","/discord","/nightmare-night","/hearthswarming-eve","/promotional-cards","/gel-pens","/acrylic-stands"]);
export function isCollectionSet(path:string){return englishSets.has(path) || /^\/cn-(?:(?:moon|fun|rainbow|star|stardust|magicbook|newyears)-(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen)|promos|laser-tickets|kuji-raffles)$/.test(path);}
const isDirectory=(path:string)=>path==="/collections" || path==="/collections-chinese";
const motionAllowed=()=>!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function themeLogo(){const root=document.documentElement;return root.dataset.theme==="light" || root.classList.contains("light") ? "/website-assets/mlpekayouwiki4.webp" : root.dataset.theme==="spooky" || root.classList.contains("spooky") ? "/website-assets/nightmarelogo.webp" : "/website-assets/darkmodelogo.webp";}
function LoadingMark(){
  const id=useId().replace(/:/g,"");
  const [logo,setLogo]=useState(themeLogo);
  const [failed,setFailed]=useState(false);
  const currentLogo=useRef(logo);
  useEffect(()=>{const update=()=>{const next=themeLogo();if(currentLogo.current!==next){currentLogo.current=next;setLogo(next);setFailed(false);}};const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:["class","data-theme","style"]});return ()=>observer.disconnect();},[]);
  const matrices=["3 -3 0 0 0","-3 3 0 0 0","3 0 -3 0 0","-3 0 3 0 0","0 3 -3 0 0","0 -3 3 0 0"];
  return <><svg width="0" height="0" aria-hidden="true" focusable="false" style={{position:"absolute"}}><defs><filter id={id} colorInterpolationFilters="sRGB">{matrices.map((row,i)=><feColorMatrix key={row} in="SourceGraphic" type="matrix" values={`0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${row}`} result={`chroma-${i}`}/>)}<feMerge result="chroma">{matrices.map((_,i)=><feMergeNode key={i} in={`chroma-${i}`}/>)}</feMerge><feComposite in="chroma" in2="SourceAlpha" operator="in" result="color-mask"/><feFlood style={{floodColor:"hsl(var(--primary))"}} result="accent"/><feComposite in="accent" in2="color-mask" operator="in" result="colored"/><feComposite in="SourceGraphic" in2="color-mask" operator="out" result="neutral"/><feMerge><feMergeNode in="neutral"/><feMergeNode in="colored"/></feMerge></filter></defs></svg>{failed?<span className="mlpe-set-loading-name">MLPEKAYOU</span>:<img className="mlpe-set-loading-logo" src={logo} alt="" style={{filter:`url(#${id})`}} onError={()=>setFailed(true)}/>}</>;
}
const styles=`
.mlpe-collection-content{min-width:0}
.mlpe-collection-content[data-assets-loading=true]{opacity:0;pointer-events:none}
.mlpe-set-loading{position:fixed;inset:var(--kayou-header-bottom,64px) 0 0;z-index:1000;display:grid;place-items:center;background:hsl(var(--background));color:hsl(var(--foreground));touch-action:none}
.mlpe-set-loading-inner{display:flex;flex-direction:column;align-items:center;gap:15px;padding:24px;text-align:center;font-family:'Oxanium',sans-serif;animation:mlpe-set-loader-in .16s ease both}
.mlpe-set-loading-logo{display:block;width:92px;height:60px;object-fit:contain;animation:mlpe-set-logo-breathe 1.9s ease-in-out infinite}
.mlpe-set-loading-name{font-size:15px;font-weight:700;letter-spacing:.08em;color:hsl(var(--primary))}
.mlpe-set-loading p{margin:0;font-size:12px;line-height:1.6;color:hsl(var(--muted-foreground))}
.mlpe-set-loading-track{display:block;width:68px;height:2px;overflow:hidden;border-radius:2px;background:hsl(var(--primary)/.13)}
.mlpe-set-loading-track:after{content:"";display:block;width:24px;height:100%;border-radius:inherit;background:hsl(var(--primary));animation:mlpe-set-loading-slide 1.3s ease-in-out infinite alternate}
.mlpe-set-loading button{min-height:40px;padding:6px 12px;border:0;border-bottom:1px solid hsl(var(--border));background:transparent;color:hsl(var(--foreground));font:inherit;font-size:12px;cursor:pointer}
.mlpe-set-loading button:focus-visible{outline:2px solid hsl(var(--primary));outline-offset:3px}
@keyframes mlpe-set-logo-breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes mlpe-set-loading-slide{from{transform:translateX(0)}to{transform:translateX(44px)}}
@keyframes mlpe-set-loader-in{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.mlpe-set-loading-inner,.mlpe-set-loading-logo,.mlpe-set-loading-track:after{animation:none!important}}
`;
export default function CollectionPageExperience({children}:{children:ReactNode}){
  const location=useLocation(),navigate=useNavigate();
  const path=location.pathname.replace(/\/+$/,"").toLowerCase() || "/";
  const setPage=isCollectionSet(path),eligible=setPage || isDirectory(path);
  const content=useRef<HTMLDivElement>(null);
  const animation=useRef<Animation | null>(null);
  const token=path;
  const [load,setLoad]=useState({key:"",busy:false,show:false,slow:false});
  const busy=setPage && (load.key!==token || load.busy);
  const release=useRef<()=>void>(()=>{});
  useLayoutEffect(()=>{
    const node=content.current;
    if(!node)return;
    let disposed=false,enterFrame=0,frame=0,quiet:ReturnType<typeof setTimeout> | undefined;
    let show:ReturnType<typeof setTimeout> | undefined,slow:ReturnType<typeof setTimeout> | undefined;
    const failed=new WeakMap<HTMLImageElement,string>(),decoded=new WeakMap<HTMLImageElement,string>(),decoding=new WeakMap<HTMLImageElement,string>();
    const enter=()=>{animation.current?.cancel();if(eligible && motionAllowed() && typeof node.animate==="function")animation.current=node.animate([{opacity:0,transform:"translateY(3px)"},{opacity:1,transform:"translateY(0)"}],{duration:180,easing:"cubic-bezier(.2,.7,.3,1)"});};
    const finish=()=>{if(disposed)return;disposed=true;if(quiet)clearTimeout(quiet);if(show)clearTimeout(show);if(slow)clearTimeout(slow);if(frame)cancelAnimationFrame(frame);observer?.disconnect();node.inert=false;setLoad({key:token,busy:false,show:false,slow:false});enterFrame=requestAnimationFrame(enter);};
    release.current=finish;
    const inView=(element:Element)=>{const r=element.getBoundingClientRect();return r.width>0 && r.height>0 && r.bottom>0 && r.top<window.innerHeight && r.right>0 && r.left<window.innerWidth;};
    const schedule=()=>{if(!disposed && !frame)frame=requestAnimationFrame(check);};
    const check=()=>{
      frame=0;if(disposed)return;
      let pending=false;
      for(const img of node.querySelectorAll<HTMLImageElement>("img")){
        if(!inView(img))continue;
        const src=img.currentSrc || img.src;
        if(failed.get(img)===src)continue;
        if(img.getAttribute("aria-busy")==="true" || !img.complete){pending=true;continue;}
        if(!img.naturalWidth || !src)continue;
        if(typeof img.decode==="function" && decoded.get(img)!==src){
          pending=true;
          if(decoding.get(img)!==src){decoding.set(img,src);void img.decode().catch(()=>{}).then(()=>{decoded.set(img,src);schedule();});}
        }
      }
      if(!pending)for(const status of node.querySelectorAll<HTMLElement>('[role="status"],[aria-busy="true"]')){
        if(inView(status) && /^loading(?:\s|\.)/i.test(status.textContent?.trim() || "")){pending=true;break;}
      }
      if(quiet)clearTimeout(quiet);
      if(!pending)quiet=setTimeout(finish,120);
    };
    const imageEvent=(event:Event)=>{if(event.type==="error" && event.target instanceof HTMLImageElement)failed.set(event.target,event.target.currentSrc || event.target.src);schedule();};
    const observer=setPage?new MutationObserver(schedule):null;
    if(setPage){
      node.inert=true;setLoad({key:token,busy:true,show:false,slow:false});
      observer?.observe(node,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["src","srcset","aria-busy","loading"]});
      node.addEventListener("load",imageEvent,true);node.addEventListener("error",imageEvent,true);
      window.addEventListener("resize",schedule);
      show=setTimeout(()=>{if(!disposed)setLoad(current=>({...current,show:true}));},200);
      slow=setTimeout(()=>{if(!disposed)setLoad(current=>({...current,slow:true}));},12000);
      schedule();
    }else{node.inert=false;setLoad({key:token,busy:false,show:false,slow:false});enter();}
    return ()=>{disposed=true;if(enterFrame)cancelAnimationFrame(enterFrame);observer?.disconnect();if(frame)cancelAnimationFrame(frame);if(quiet)clearTimeout(quiet);if(show)clearTimeout(show);if(slow)clearTimeout(slow);node.removeEventListener("load",imageEvent,true);node.removeEventListener("error",imageEvent,true);window.removeEventListener("resize",schedule);animation.current?.cancel();node.inert=false;};
  },[token,path,setPage,eligible]);
  useEffect(()=>{
    if(!eligible)return;
    let leaving=false,cancelled=false;
    const click=(event:MouseEvent)=>{
      if(event.defaultPrevented || event.button!==0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !motionAllowed() || busy)return;
      const a=event.target instanceof Element?event.target.closest<HTMLAnchorElement>("a[href]"):null;
      if(!a || a.hasAttribute("download") || (a.target && a.target!=="_self"))return;
      const url=new URL(a.href,window.location.href),next=url.pathname.replace(/\/+$/,"").toLowerCase() || "/";
      if(url.origin!==window.location.origin || next===path || (!isCollectionSet(next) && !isDirectory(next)))return;
      const node=content.current;if(!node || typeof node.animate!=="function")return;
      event.preventDefault();if(leaving)return;leaving=true;
      animation.current?.cancel();animation.current=node.animate([{opacity:1},{opacity:0}],{duration:100,fill:"forwards",easing:"ease-out"});
      void animation.current.finished.catch(()=>{}).then(()=>{if(!cancelled)navigate(url.pathname+url.search+url.hash);});
    };
    document.addEventListener("click",click,true);
    return ()=>{cancelled=true;document.removeEventListener("click",click,true);};
  },[path,eligible,busy,navigate]);
  if(!eligible)return <>{children}</>;
  return <><style>{styles}</style><div ref={content} className={eligible?"mlpe-collection-content":undefined} data-assets-loading={busy || undefined} aria-hidden={busy || undefined}>{children}</div>{busy && load.show && createPortal(<div className="mlpe-set-loading"><div className="mlpe-set-loading-inner" role="status" aria-live="polite"><LoadingMark/><p>{load.slow?"A few images are taking longer to load.":"hold on just one second..."}</p>{load.slow?<button type="button" onClick={()=>release.current()}>Show cards</button>:<span className="mlpe-set-loading-track" aria-hidden="true"/>}</div></div>,document.body)}</>;
}