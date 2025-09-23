import {
  Assignment,
  BarChart,
  Close,
  FolderOpen,
  Gavel,
  Home,
  People,
  Settings,
  Shield,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import logo from "/assets/isologo.svg";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const dashboard = {
  label: "Início",
  icon: <Home sx={{ fontSize: 20 }} />,
  path: "/organization-home",
  description: "Painel inicial do sistema",
};

const modules = [
  {
    label: "Planejamento da Contratação",
    icon: <FolderOpen sx={{ fontSize: 20 }} />,
    path: "/planejamento-da-contratacao",
    description: "Organize todas as fases da contratação",
  },
  {
    label: "Gestão Contratual",
    icon: <People sx={{ fontSize: 20 }} />,
    path: "/gestao-contratual",
    description: "Gerencie contratos e documentos",
    disabled: true,
  },
  {
    label: "Execução Contratual",
    icon: <Assignment sx={{ fontSize: 20 }} />,
    path: "/execucao-contratual",
    description: "Monitore a execução do contrato",
    disabled: true,
  },
  {
    label: "Processo Licitatório",
    icon: <Gavel sx={{ fontSize: 20 }} />,
    path: "/processo-licitatorio",
    description: "Acompanhe o processo licitatório",
    disabled: true,
  },
  {
    label: "Relatórios",
    icon: <BarChart sx={{ fontSize: 20 }} />,
    path: "/relatorios",
    description: "Visualize dados estratégicos",
    disabled: true,
  },
  {
    label: "Configurações do Fluxo",
    icon: <Settings sx={{ fontSize: 20 }} />,
    path: "/configuracoes-fluxo",
    description: "Personalize o fluxo de trabalho",
    disabled: true,
  },
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Simulação de dados do usuário
  const user = {
    gerencia: "Comissão de Implantação",
  };

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const handleModuleClick = (module: any) => {
    navigate(module.path);
    onClose();
  };

  const isActiveModule = (modulePath: string) => {
    return (
      location.pathname === modulePath ||
      (modulePath === "/organization-home" &&
        location.pathname === "/organization-home") ||
      (modulePath === "/planejamento-da-contratacao" &&
        location.pathname === "/planejamento-da-contratacao") ||
      (modulePath === "/administracao" &&
        location.pathname === "/administracao")
    );
  };

  const isActiveDashboard = (dashboardPath: string) => {
    return location.pathname === dashboardPath;
  };

  // TODO: Implementar permissões de administração do usuário para acessar o painel de administração
  // TODO: Implementar usuario sempre logado para fazer acoes dentro da topbar e sidebar
  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 64,
          px: 3,
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#f9fafb",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <img
            src={logo}
            alt="Logo Fiscatus"
            style={{ width: 32, height: 32 }}
          />
          <Typography
            variant="h6"
            sx={{
              fontSize: "1.125rem",
              fontWeight: 600,
              color: "#111827",
            }}
          >
            Fiscatus
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            p: 1,
            borderRadius: 1,
            "&:hover": {
              backgroundColor: "#e5e7eb",
            },
          }}
          aria-label="Fechar sidebar"
        >
          <Close sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <Box sx={{ px: 2, mb: 2 }}>
          <ListItemButton
            onClick={() => handleModuleClick(dashboard)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              borderLeft: isActiveDashboard(dashboard.path)
                ? "4px solid #2563eb"
                : "4px solid transparent",
              backgroundColor: isActiveDashboard(dashboard.path)
                ? "#eff6ff"
                : "transparent",
              color: isActiveDashboard(dashboard.path) ? "#2563eb" : "#374151",
              "&:hover": {
                backgroundColor: isActiveDashboard(dashboard.path)
                  ? "#eff6ff"
                  : "#f9fafb",
                borderLeft: isActiveDashboard(dashboard.path)
                  ? "4px solid #2563eb"
                  : "4px solid #d1d5db",
              },
              py: 1,
              px: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveDashboard(dashboard.path)
                  ? "#2563eb"
                  : "#6b7280",
              }}
            >
              {dashboard.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.2,
                    fontSize: "0.875rem",
                  }}
                >
                  {dashboard.label}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    fontSize: "0.75rem",
                  }}
                >
                  {dashboard.description}
                </Typography>
              }
            />
          </ListItemButton>
        </Box>

        <Box sx={{ px: 2, mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 1,
              display: "block",
            }}
          >
            Módulos do Sistema
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {modules.map((module, idx) => (
            <ListItem key={module.label} disablePadding sx={{ mb: 0.25 }}>
              <ListItemButton
                onClick={() => handleModuleClick(module)}
                disabled={module.disabled}
                sx={{
                  borderRadius: 1,
                  borderLeft: isActiveModule(module.path)
                    ? "4px solid #2563eb"
                    : "4px solid transparent",
                  backgroundColor: isActiveModule(module.path)
                    ? "#eff6ff"
                    : "transparent",
                  color: isActiveModule(module.path)
                    ? "#2563eb"
                    : module.disabled
                    ? "#9ca3af"
                    : "#374151",
                  opacity: module.disabled ? 0.5 : 1,
                  cursor: module.disabled ? "not-allowed" : "pointer",
                  "&:hover": {
                    backgroundColor: module.disabled
                      ? "transparent"
                      : isActiveModule(module.path)
                      ? "#eff6ff"
                      : "#f9fafb",
                    borderLeft: module.disabled
                      ? "4px solid transparent"
                      : isActiveModule(module.path)
                      ? "4px solid #2563eb"
                      : "4px solid #d1d5db",
                  },
                  py: 1,
                  px: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isActiveModule(module.path)
                      ? "#2563eb"
                      : module.disabled
                      ? "#9ca3af"
                      : "#6b7280",
                  }}
                >
                  {module.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        lineHeight: 1.2,
                        fontSize: "0.875rem",
                        color: module.disabled ? "#9ca3af" : "inherit",
                      }}
                    >
                      {module.label}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#6b7280",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.2,
                        fontSize: "0.75rem",
                      }}
                    >
                      {module.description}
                    </Typography>
                  }
                />
                {module.disabled && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#9ca3af",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    Em breve
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* TODO: tratar permissões de administração do usuário para acessar o painel de administração */}
      {user?.gerencia === "Comissão de Implantação" && (
        <Box sx={{ borderTop: "1px solid #e5e7eb", p: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              mb: 1,
              display: "block",
            }}
          >
            Acesso Rápido
          </Typography>

          <ListItemButton
            onClick={() =>
              handleModuleClick({
                label: "Administração",
                icon: <Shield sx={{ fontSize: 16 }} />,
                path: "/administracao",
                description: "Painel de administração",
              })
            }
            sx={{
              borderRadius: 1,
              border: isActiveModule("/administracao")
                ? "1px solid #bfdbfe"
                : "1px solid transparent",
              backgroundColor: isActiveModule("/administracao")
                ? "#eff6ff"
                : "transparent",
              color: isActiveModule("/administracao") ? "#2563eb" : "#4b5563",
              "&:hover": {
                backgroundColor: isActiveModule("/administracao")
                  ? "#eff6ff"
                  : "#f9fafb",
                border: isActiveModule("/administracao")
                  ? "1px solid #bfdbfe"
                  : "1px solid #e5e7eb",
              },
              py: 1,
              px: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 32,
                color: isActiveModule("/administracao") ? "#2563eb" : "#6b7280",
              }}
            >
              <Shield sx={{ fontSize: 16 }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    lineHeight: 1.2,
                  }}
                >
                  Administração
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{
                    color: "#6b7280",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.2,
                    fontSize: "0.75rem",
                  }}
                >
                  Painel de administração
                </Typography>
              }
            />
          </ListItemButton>
        </Box>
      )}

      <Box sx={{ borderTop: "1px solid #e5e7eb", p: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="caption"
            sx={{
              color: "#6b7280",
              fontSize: "0.75rem",
              display: "block",
            }}
          >
            Fiscatus v1.0.0
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "#6b7280",
              fontSize: "0.75rem",
              display: "block",
              mt: 0.5,
            }}
          >
            Gestão inteligente e integrada para contratações públicas.
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 40,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transition: "opacity 200ms, visibility 200ms",
          display: { xs: "block", md: "none" },
        }}
        onClick={onClose}
      />

      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{
          width: 320,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 320,
            boxSizing: "border-box",
            backgroundColor: "white",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 50,
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export { Sidebar };
