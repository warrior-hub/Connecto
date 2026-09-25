
import {
  MessageCircle,
  CircleDot,
  UserRound,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const AppNavigation = () => {
  return (
    <div
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-40
        h-14

        bg-[#202c33]
        border-t
        border-[#2a3942]

        flex
        items-center
        justify-around

        md:top-0
        md:bottom-auto
        md:left-0
        md:right-auto

        md:w-[72px]
        md:h-screen

        md:flex-col
        md:justify-start
        md:items-center

        md:border-t-0
        md:border-r
        md:border-[#2a3942]

        py-2
      "
    >
      {/* ================= CHAT ================= */}
      <NavLink
        to="/chat"
        className={({ isActive }) =>
          `
            flex
            flex-col
            items-center
            justify-center
            gap-0.5

            w-20
            md:w-[56px]

            h-full
            md:h-16

            rounded-lg
            transition

            ${
              isActive
                ? "bg-[#2a3942] text-green-400"
                : "text-[#8696a0] hover:text-white hover:bg-[#2a3942]"
            }
          `
        }
      >
        <MessageCircle size={22} />

        <span className="text-[10px]">
          Chats
        </span>
      </NavLink>

      {/* ================= STATUS ================= */}
      <NavLink
        to="/status"
        className={({ isActive }) =>
          `
            flex
            flex-col
            items-center
            justify-center
            gap-0.5

            w-20
            md:w-[56px]

            h-full
            md:h-16

            rounded-lg
            transition

            ${
              isActive
                ? "bg-[#2a3942] text-green-400"
                : "text-[#8696a0] hover:text-white hover:bg-[#2a3942]"
            }
          `
        }
      >
        <CircleDot size={22} />

        <span className="text-[10px]">
          Status
        </span>
      </NavLink>

      {/* ================= PROFILE ================= */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `
            flex
            flex-col
            items-center
            justify-center
            gap-0.5

            w-20
            md:w-[56px]

            h-full
            md:h-16

            rounded-lg
            transition

            ${
              isActive
                ? "bg-[#2a3942] text-green-400"
                : "text-[#8696a0] hover:text-white hover:bg-[#2a3942]"
            }
          `
        }
      >
        <UserRound size={22} />

        <span className="text-[10px]">
          Profile
        </span>
      </NavLink>
    </div>
  );
};

export default AppNavigation;
