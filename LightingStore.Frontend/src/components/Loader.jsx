import logo from "../assets/loadlogo.png";

export default function Loader({ progress }) {
  return (
    <div className="fixed inset-0 bg-[#dbdbdb] flex flex-col items-center justify-center z-50">

      <div className="w-[1200px] h-[220px] overflow-hidden flex items-start justify-center">
        <img
          src={logo}
          alt="loading"
          className="w-[360px] -mt-[10px] animate-swing select-none pointer-events-none"
        />
      </div>

      <div className="mt-14 text-gray-600 tracking-[0.25em] text-sm">
        YÜKLENİYOR %{Math.floor(progress)}
      </div>

      <div className="w-40 h-[2px] bg-gray-300 mt-4 overflow-hidden">
        <div
          className="h-full bg-gray-800 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
}
