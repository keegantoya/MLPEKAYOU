import KayouHeader from "@/components/KayouHeader";

const Star1 = () => {
  return (
    <div className="min-h-screen bg-background">
      <KayouHeader />

      <div className="flex items-center justify-center min-h-[80vh] px-6">
        <p className="text-yellow-400 text-center text-lg md:text-xl max-w-2xl font-semibold">
          KAYOUUS will not allow me to release the files for Eternal Star First Volume until the set's official debut. 
          Check back here when the set releases in the US!
        </p>
      </div>
    </div>
  );
};

export default Star1;