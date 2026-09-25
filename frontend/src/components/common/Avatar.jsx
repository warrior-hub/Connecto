export default function Avatar({
  src,
  name,
  size = "md",
  online = false,
}) {
  const sizes = {
    sm: "w-9 h-9 text-sm",
    md: "w-11 h-11 text-base",
    lg: "w-16 h-16 text-xl",
  };

  const getInitial = () => {
    if (!name) return "?";

    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-black font-bold`}
        >
          {getInitial()}
        </div>
      )}

      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111b21] rounded-full" />
      )}
    </div>
  );
}