
import {
  ArrowLeft,
  Camera,
  Edit3,
  LogOut,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { useState } from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
  updateUser,
  logout,
} from "../redux/authSlice";

import Avatar from "../components/common/Avatar";
import EditProfileModal from "../components/profile/EditProfileModal";
import AppNavigation from "../components/common/AppNavigation";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector(
    (state) => state.auth.user
  );

  const [showEditModal, setShowEditModal] =
    useState(false);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) {
      return;
    }

    // Redux auth clear
    dispatch(logout());

    // LocalStorage clear
    localStorage.removeItem("vibetalk_token");
    localStorage.removeItem("vibetalk_user");

    // Login page
    navigate("/login", {
      replace: true,
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b141a] text-white flex items-center justify-center">
        <p className="text-[#8696a0]">
          User not found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-[#0b141a] text-white overflow-hidden">

      {/* =============================== */}
      {/* APP NAVIGATION */}
      {/* =============================== */}

      <AppNavigation />

      {/* =============================== */}
      {/* TOP HEADER */}
      {/* =============================== */}

      <div
        className="
          fixed
          top-0
          left-0
          right-0
          z-30
          h-16
          bg-[#202c33]
          border-b
          border-[#2a3942]
          md:left-[72px]
        "
      >
        <div className="h-full flex items-center px-3 sm:px-5">

          <button
            type="button"
            onClick={() => navigate("/chat")}
            className="
              p-2
              mr-2
              rounded-full
              text-[#aebac1]
              hover:text-white
              hover:bg-[#2a3942]
              transition
            "
          >
            <ArrowLeft size={21} />
          </button>

          <h1 className="text-lg font-semibold">
            Profile
          </h1>

        </div>
      </div>

      {/* =============================== */}
      {/* MAIN */}
      {/* =============================== */}

      <main
        className="
          h-full
          overflow-y-auto
          pt-16
          pb-14
          md:pb-0
          md:pl-[72px]
        "
      >
        <div className="min-h-full flex justify-center">

          <div className="w-full max-w-2xl px-4 sm:px-6 py-6 sm:py-8">

            {/* =============================== */}
            {/* PROFILE HEADER */}
            {/* =============================== */}

            <div className="flex flex-col items-center">

              {/* PROFILE PICTURE */}

              <div className="relative">

                <div
                  className="
                    w-24
                    h-24
                    sm:w-28
                    sm:h-28
                    md:w-32
                    md:h-32
                    rounded-full
                    overflow-hidden
                  "
                >
                  <Avatar
                    src={currentUser.profilePicture}
                    name={currentUser.name}
                    size="xl"
                  />
                </div>

                {/* CAMERA BUTTON */}

                <button
                  type="button"
                  title="Change profile picture"
                  className="
                    absolute
                    right-0
                    bottom-0
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    rounded-full
                    bg-green-500
                    text-black
                    flex
                    items-center
                    justify-center
                    border-4
                    border-[#0b141a]
                    hover:bg-green-400
                    transition
                  "
                >
                  <Camera
                    size={15}
                    className="sm:w-[17px] sm:h-[17px]"
                  />
                </button>

              </div>

              {/* NAME */}

              <h2
                className="
                  mt-4
                  text-xl
                  sm:text-2xl
                  font-semibold
                  text-center
                "
              >
                {currentUser.name}
              </h2>

              {/* USERNAME */}

              <p className="text-[#8696a0] mt-1 text-sm sm:text-base">
                @{currentUser.username}
              </p>

              {/* BIO */}

              <p
                className="
                  text-sm
                  text-[#8696a0]
                  mt-3
                  text-center
                  max-w-md
                  leading-5
                "
              >
                {currentUser.bio ||
                  "Hey there! I am using VibeTalk."}
              </p>

            </div>

            {/* =============================== */}
            {/* EDIT PROFILE */}
            {/* =============================== */}

            <button
              type="button"
              onClick={() =>
                setShowEditModal(true)
              }
              className="
                w-full
                mt-7
                flex
                items-center
                justify-center
                gap-2
                bg-[#202c33]
                hover:bg-[#2a3942]
                text-white
                font-medium
                py-3
                rounded-lg
                border
                border-[#2a3942]
                transition
              "
            >
              <Edit3 size={18} />

              Edit Profile
            </button>

            {/* =============================== */}
            {/* ACCOUNT INFORMATION */}
            {/* =============================== */}

            <div className="mt-6">

              <h3
                className="
                  text-sm
                  text-[#8696a0]
                  mb-2
                  px-1
                "
              >
                Account Information
              </h3>

              <div
                className="
                  bg-[#202c33]
                  rounded-xl
                  overflow-hidden
                  border
                  border-[#2a3942]
                "
              >

                {/* NAME */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    border-b
                    border-[#2a3942]
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#2a3942]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <UserRound
                      size={19}
                      className="text-[#aebac1]"
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-[#8696a0]">
                      Name
                    </p>

                    <p className="text-white mt-1 truncate">
                      {currentUser.name}
                    </p>

                  </div>

                </div>

                {/* USERNAME */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    border-b
                    border-[#2a3942]
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#2a3942]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <span className="text-[#aebac1] text-lg">
                      @
                    </span>
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-[#8696a0]">
                      Username
                    </p>

                    <p className="text-white mt-1 truncate">
                      @{currentUser.username}
                    </p>

                  </div>

                </div>

                {/* EMAIL */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                    border-b
                    border-[#2a3942]
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#2a3942]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Mail
                      size={19}
                      className="text-[#aebac1]"
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-[#8696a0]">
                      Email
                    </p>

                    <p className="text-white mt-1 truncate">
                      {currentUser.email}
                    </p>

                  </div>

                </div>

                {/* PHONE */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                    px-4
                    py-4
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-full
                      bg-[#2a3942]
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Phone
                      size={19}
                      className="text-[#aebac1]"
                    />
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs text-[#8696a0]">
                      Phone
                    </p>

                    <p className="text-white mt-1 truncate">
                      {currentUser.phone ||
                        "Not added"}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =============================== */}
            {/* BIO */}
            {/* =============================== */}

            <div className="mt-6">

              <h3
                className="
                  text-sm
                  text-[#8696a0]
                  mb-2
                  px-1
                "
              >
                About
              </h3>

              <div
                className="
                  bg-[#202c33]
                  border
                  border-[#2a3942]
                  rounded-xl
                  px-4
                  py-4
                "
              >

                <p className="text-white leading-6 break-words">
                  {currentUser.bio ||
                    "Hey there! I am using VibeTalk."}
                </p>

              </div>

            </div>

            {/* =============================== */}
            {/* ACCOUNT STATUS */}
            {/* =============================== */}

            <div className="mt-6">

              <div
                className="
                  bg-[#202c33]
                  border
                  border-[#2a3942]
                  rounded-xl
                  px-4
                  py-4
                "
              >

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-white font-medium">
                      Account Status
                    </p>

                    <p className="text-sm text-[#8696a0] mt-1">
                      Your VibeTalk account is active
                    </p>

                  </div>

                  <span
                    className="
                      px-3
                      py-1
                      rounded-full
                      bg-green-500/10
                      text-green-400
                      text-xs
                      font-medium
                      shrink-0
                    "
                  >
                    Active
                  </span>

                </div>

              </div>

            </div>

            {/* =============================== */}
            {/* LOGOUT */}
            {/* =============================== */}

            <div className="mt-6">

              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-lg
                  border
                  border-red-500/30
                  bg-red-500/10
                  text-red-400
                  hover:bg-red-500/20
                  hover:text-red-300
                  transition
                  font-medium
                "
              >
                <LogOut size={18} />

                Logout
              </button>

            </div>

            {/* =============================== */}
            {/* FOOTER */}
            {/* =============================== */}

            <p className="text-center text-xs text-[#8696a0] mt-8 pb-2">
              VibeTalk 2.0
            </p>

          </div>
        </div>
      </main>

      {/* =============================== */}
      {/* EDIT PROFILE MODAL */}
      {/* =============================== */}

      {showEditModal && (
        <EditProfileModal
          onClose={() =>
            setShowEditModal(false)
          }

          onUpdated={(updatedUser) => {
            console.log(
              "Updated user:",
              updatedUser
            );

            dispatch(
              updateUser(updatedUser)
            );

            setShowEditModal(false);
          }}
        />
      )}

    </div>
  );
};

export default Profile;
