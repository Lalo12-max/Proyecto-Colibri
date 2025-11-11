import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authUser, authDriver } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverSession, setDriverSession] = useState(null);

  // Cargar desde localStorage
  useEffect(() => {
    try {
      const u = localStorage.getItem('colibri:user');
      const us = localStorage.getItem('colibri:userSession');
      const d = localStorage.getItem('colibri:driver');
      const ds = localStorage.getItem('colibri:driverSession');
      if (u) setUser(JSON.parse(u));
      if (us) setUserSession(JSON.parse(us));
      if (d) setDriver(JSON.parse(d));
      if (ds) setDriverSession(JSON.parse(ds));
    } catch {}
  }, []);

  const loginUser = async (email, password) => {
    const res = await authUser.login({ email, password });
    setUser(res.user);
    setUserSession(res.session || null);
    localStorage.setItem('colibri:user', JSON.stringify(res.user));
    localStorage.setItem('colibri:userSession', JSON.stringify(res.session || null));
    return res;
  };

  const registerUser = async (payload) => {
    const res = await authUser.register(payload);
    return res;
  };

  const logoutUser = () => {
    setUser(null);
    setUserSession(null);
    localStorage.removeItem('colibri:user');
    localStorage.removeItem('colibri:userSession');
  };

  const loginDriver = async (email, password) => {
    const res = await authDriver.login({ email, password });
    setDriver(res.user);
    setDriverSession(res.session || null);
    localStorage.setItem('colibri:driver', JSON.stringify(res.user));
    localStorage.setItem('colibri:driverSession', JSON.stringify(res.session || null));
    return res;
  };

  const registerDriver = async (payload) => {
    const res = await authDriver.register(payload);
    return res;
  };

  const logoutDriver = () => {
    setDriver(null);
    setDriverSession(null);
    localStorage.removeItem('colibri:driver');
    localStorage.removeItem('colibri:driverSession');
  };

  const value = useMemo(
    () => ({
      user,
      userSession,
      driver,
      driverSession,
      loginUser,
      registerUser,
      logoutUser,
      loginDriver,
      registerDriver,
      logoutDriver,
      getUserToken: () => userSession?.access_token || null,
      getDriverToken: () => driverSession?.access_token || null,
      // Autorrelleno: helpers de identidad
      getUserId: () => user?.id || null,
      getDriverId: () => driver?.id || null,
      getUserEmail: () => user?.email || null,
      getDriverEmail: () => driver?.email || null,
    }),
    [user, userSession, driver, driverSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);