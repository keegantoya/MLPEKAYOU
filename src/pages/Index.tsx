import React from "react";

export default function Index() {
  return (
    <main className="min-h-screen bg-[hsl(var(--background))] px-3 py-5 text-zinc-900 dark:text-zinc-100 sm:px-6 sm:py-10">
      <article className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-[0_16px_50px_rgba(0,0,0,0.08)] dark:border-white/10 dark:bg-[#17191b] dark:shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
        <header className="border-b border-black/10 px-5 py-7 dark:border-white/10 sm:px-9 sm:py-9">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#80630b] dark:text-[#E7C84B]">A note from the lady who runs this</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">I need to take a little time away</h1>
          <p className="mt-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 sm:text-base">Hi! That's me! Surprise! A lot of people seem to think I am Kayou Official, but no. This website is not owned or run by Kayou at all!</p>
        </header>

        <figure className="border-b border-black/10 bg-zinc-100 p-2 dark:border-white/10 dark:bg-[#101112] sm:p-4">
          <img
            src={"/kayou's-assets/IMG_0567.webp"}
            alt="Keegan!"
            className="mx-auto max-h-[560px] w-full rounded-2xl object-contain"
          />
        </figure>

        <div className="mx-auto max-w-6xl space-y-8 px-5 py-7 text-[15px] leading-7 text-zinc-700 dark:text-zinc-300 sm:px-9 sm:py-10 sm:text-base sm:leading-8 lg:px-14">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">MLPEKAYOU Means a LOT to me</h2>
            <p>My name is Keegan, and I am the sole developer of MLPEKAYOU. Everything you see, I built myself, with my own two hands, over the span of about nine or so months now. MLPEKAYOU's first rollout was in April of 2026, and boy, was it rough. I've lived and I've learned, and I've gotten much better at what I've done.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">What is Happening?</h2>
            <p>I am unfortunately needing a mental health break. I have befriended many members of this community, many of whom have turned out to be some of the worst individuals I've ever met in my life. I will not surround myself with people who stoop to low levels or do not have the general community's best interests in mind. I have met many selfish, downright disgusting people, and I have also met some of the kindest, most loving people in my entire life since I took on this project. Unfortunately, right now, the negative people are outweighing the positive for me. For my mental health, I am choosing to take a small step back for some time.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">Please understand where I am coming from</h2>
            <p>Many people seem to fail to understand that I am not like them, and that I do not perceive things the way they do. I come from an environment that is do or die, where freaking out is sometimes the only answer, because occasionally freaking out is the only reason some people get to go home or not. It may sound silly in comparison with something so small like pony cards, but when it consumed my life and ended in my leaving with traumatic brain injuries, it hardwired me into a new personality and a new way of thinking that I cannot simply forget. All of the scars on my face and my body tell different stories that I don't want to repeat, but they should serve as a reminder that we are not the same.</p>
            <p>I host this website for free. I require zero payments or paywalls. It is very expensive for me to maintain, and very stressful for me to own and run. I ask that if you see me behaving in a way that you deem not normal, you remind yourself that we are not the same and we come from two different places. You haven't lived the life I have, and you are (hopefully) not medicated for PTSD. You do not have to attend physical therapy for injuries that will last a lifetime. You do not have to go to cognitive and speech therapy in an attempt to restore what brain damage took from you. If you know what I mean when I say I was an 11C for the 81s/120s, I don't know if I should say I love you or I'm sorry. If you don't know what that means, I'm happy for you.</p>
            <p>We do not act or behave the same, because we are not the same. You do not come from where I do. Making fun of me for not fully being capable of grasping or understanding basics is not as funny as you think it is. Making fun of me for freaking out over little things that are insignificant to you isn't funny, because we do not think the same. We never will. My brain has been damaged and rewired until I looked in the mirror and didn't recognize who was looking back at me. I often must have help getting up out of chairs and be strapped to heart monitors some days when my physical condition declines beyond me helping myself. My mental condition is not much better.</p>
            <p>Please think of that when you find it funny to make fun of me in public or private forums about how I process, understand, or react to things. I do not and will not ever think or process things on the same level as you. I would love to change the way that I am, but I am incapable. I don't know who I am anymore. I am struggling deeply with my identity and behavior that I am left unable to control or understand after all of my brain injuries.</p>
          </section>

          <section className="space-y-4 rounded-2xl border border-[#E7C84B]/40 bg-[#E7C84B]/10 p-5 dark:border-[#E7C84B]/25 dark:bg-[#E7C84B]/[0.06] sm:p-6">
            <h2 className="text-xl font-bold text-[#705607] dark:text-[#FFE477] sm:text-2xl">Thank you for giving me space</h2>
            <p>I do all of this for you for free. I want nothing in return. You don't owe me anything. Sometimes I even feel like I do all of this for nothing. I feel like I have given, and given, and given, and people have spat in my face over insignificant things. I don't want to be spat on anymore. My mental health cannot take it.</p>
            <p>Thank you for your understanding and your time. The homepage will be restored and MLPEKAYOU's development will continue when I feel I am mentally ready to continue this project. I hope this is considered conducting myself professionally in a public space, I'm not sure. If this all upset or offended you, I apologize. I think honesty is always better than ghosting or silence. I am not abandoning you. I just can't do this right now.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
