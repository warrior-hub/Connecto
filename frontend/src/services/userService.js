import api from "./api";


// ==========================================
// GET USERS
// ==========================================

export const getUsers = async (token) => {
  const response = await api.get(
    "/users",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


// ==========================================
// UPDATE PROFILE
// ==========================================

export const updateProfile = async (
  profileData,
  token,
  profileImage
) => {

  const formData = new FormData();


  // --------------------------------------
  // TEXT DATA
  // --------------------------------------

  formData.append(
    "name",
    profileData.name
  );

  formData.append(
    "username",
    profileData.username
  );

  formData.append(
    "phone",
    profileData.phone || ""
  );

  formData.append(
    "bio",
    profileData.bio || ""
  );


  // --------------------------------------
  // PROFILE IMAGE
  // --------------------------------------

  if (profileImage) {
    formData.append(
      "profilePicture",
      profileImage
    );
  }


  const response = await api.patch(
    "/users/profile",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


  return response.data;
};