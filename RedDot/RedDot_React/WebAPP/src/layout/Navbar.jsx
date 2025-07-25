import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  EmojiEvents,
  HowToReg,
  Assessment,
  Person,
  Logout
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Estado del usuario - aquí puedes conectar con tu sistema de autenticación
  const [user, setUser] = useState({
    isLoggedIn: true, // Cambia a false para probar el botón de iniciar sesión
    name: "Juan Pérez",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" // URL de ejemplo
  });

  const menuItems = [
    { name: "Torneos", path: "/tournaments", icon: <EmojiEvents /> },
    { name: "Inscripciones", path: "/inscriptions", icon: <HowToReg /> },
    { name: "Resultados", path: "/results", icon: <Assessment /> }
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogin = () => {
    navigate('/');
  };

  const handleLogout = () => {
    // Aquí implementarías la lógica de logout
    setUser({ isLoggedIn: false, name: "", avatar: "" });
    handleUserMenuClose();
    navigate('/'); // Redirigir a la página de login
  };

  const handleProfile = () => {
    navigate('/profile');
    handleUserMenuClose();
  };

  

 
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 40px)',
        maxWidth: '1200px',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #12151c 0%, #2a3441 100%)',
        boxShadow: '0px 8px 32px rgba(221, 52, 52, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
      elevation={0}
    >
      <Toolbar sx={{ minHeight: '64px' }}>
        {/* Logo/Brand */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={() => navigate('/home')}
        >
          <span style={{
            color: '#ff4444',
            textShadow: '0 0 10px rgba(255, 68, 68, 0.5)',
            fontSize: '1.5rem',
          }}>
            Red
          </span>
          <span style={{
            background: 'linear-gradient(45deg, #fff, #64b5f6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            fontSize: '1.5rem',
          }}>
            Dot
          </span>
        </Typography>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {menuItems.map((item, index) => (
              <Button
                key={index}
                color="inherit"
                startIcon={item.icon}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 4px 16px rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                {item.name}
              </Button>
            ))}
            
            {/* Línea divisoria */}
            <Box
              sx={{
                width: '1px',
                height: '30px',
                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.3), transparent)',
                mx: 2,
              }}
            />
          </Box>
        )}

        {/* User Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {user.isLoggedIn ? (
            <>
              {/* Usuario logueado - Desktop */}
              {!isMobile && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mr: 1, 
                    color: 'white',
                    fontWeight: 500,
                  }}
                >
                  {user.name}
                </Typography>
              )}
              
              {/* Avatar clickeable */}
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{
                  p: 0,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 0 20px rgba(255, 68, 68, 0.4)',
                  }
                }}
              >
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid rgba(255, 68, 68, 0.5)',
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
              </IconButton>

              {/* Menu del usuario */}
              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={handleUserMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: 'rgba(18, 21, 28, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    mt: 1,
                    minWidth: 200,
                  }
                }}
              >
                {isMobile && (
                  <MenuItem disabled sx={{ color: 'white', opacity: 0.7 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      {user.name}
                    </Box>
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={handleProfile}
                  sx={{ 
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person />
                    Mi Perfil
                  </Box>
                </MenuItem>
                <MenuItem 
                  onClick={handleLogout}
                  sx={{ 
                    color: '#ff4444',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 68, 68, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Logout  />
                    Cerrar Sesión
                  </Box>
                </MenuItem>
              </Menu>
            </>
          ) : (
            /* Botón de Iniciar Sesión */
            <Button
              onClick={handleLogin}
              sx={{
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: 3,
                px: 3,
                py: 1,
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(255, 68, 68, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#e63939',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 68, 68, 0.4)',
                }
              }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>

        {/* Mobile Menu Icon */}
        {isMobile && (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{
                ml: 1,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'rotate(90deg)',
                }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  backgroundColor: 'rgba(18, 21, 28, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  mt: 1,
                }
              }}
            >
              {menuItems.map((item, index) => (
                <MenuItem 
                  key={index} 
                  onClick={() => handleNavigation(item.path)}
                  sx={{ 
                    minWidth: 150,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.icon}
                    {item.name}
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};