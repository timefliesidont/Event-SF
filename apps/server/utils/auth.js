import jwt from 'jsonwebtoken';

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
  );

  return { accessToken, refreshToken };
};

export const normalizeUser = (dbUser) => {
  if(dbUser){
    return {
      id: dbUser.ID,
      name: dbUser.NAME,
      email: dbUser.EMAIL,
      password: dbUser.PASSWORD,
      role: dbUser.ROLE,
    }
  }
};


