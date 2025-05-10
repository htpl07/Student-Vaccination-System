export const logout = () => {
      sessionStorage.removeItem('isAuthenticated');
      localStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('loginTime');
      localStorage.removeItem('loginTime');
    };
    