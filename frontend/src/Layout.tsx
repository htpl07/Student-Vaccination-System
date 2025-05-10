// src/Layout.tsx
import {
  AppShell,
  NavLink,
  ScrollArea,
  Title,
  Group,
  Container,
  Button,
  Menu,
  rem,
} from '@mantine/core';
import {
  IconDashboard,
  IconUsers,
  IconCalendar,
  IconFileText,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { logout } from './utils/Logout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: IconDashboard, to: '/' },
    { label: 'Students', icon: IconUsers, to: '/students' },
    { label: 'Drives', icon: IconCalendar, to: '/drives' },
    { label: 'Reports', icon: IconFileText, to: '/reports' },
  ];

  const handleLogout = () => {
  logout();  // clears all stored auth info
  notifications.show({
    title: 'Logged out successfully',
    message: 'You have been logged out of the system',
    color: 'teal',
  });
  navigate('/login');
};

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm' }}
      padding="md"
      styles={{
        main: {
          backgroundColor: '#f8f9fa',
        },
        header: {
          backgroundColor: '#663399', 
          borderBottom: '1px solid #c7d2fe',
        },
        navbar: {
          backgroundColor: '#f3f4f6', 
          borderRight: '1px solid #ddd6fe',
        },
      }}
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Title order={3} c="white">Vaccination Portal</Title>
          
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="transparent"
                color="white"
                rightSection={<IconChevronDown size={14} />}
              >
                Account
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                onClick={handleLogout}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md">
        <ScrollArea>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={location.pathname === item.to}
              onClick={() => navigate(item.to)}
              variant="light"
              mb="sm"
              fw={500}
              styles={{
                root: {
                  borderRadius: 'var(--mantine-radius-md)',
                  paddingLeft: 'var(--mantine-spacing-md)',
                  '&[data-active]': {
                    backgroundColor: '#6D244C',
                    color: '#E44C9F',
                  },
                  '&:hover': {
                    backgroundColor: '#F5F5FF',
                  }
                },
                label: {
                  color: location.pathname === item.to ? '#663399' : 'inherit',
                },
              }}
            />
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      {/* Main content */}
      <AppShell.Main>
        <Container size="xl" p="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}