import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Group,
  Checkbox,
  Anchor,
  Stack,
  Center,
  rem,
  Box,
  Image
} from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import cartoonSchool from '../images/cartoonschool025.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    initialValues: {
      email: 'harshitha_admin@school.edu',
      password: 'harshitha123',
      remember: false,
    },
    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length >= 6 ? null : 'Password must be at least 6 characters'),
    },
  });

  const handleSubmit = () => {
    setLoading(true);
    
    setTimeout(() => {
      if (form.values.email === 'harshitha_admin@school.edu' && form.values.password === 'harshitha123') {
        notifications.show({
          title: 'Login successful',
          message: 'Welcome back, School Coordinator!',
          color: 'teal',
        });
  
        const loginTime = Date.now().toString();
        if (form.values.remember) {
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('loginTime', loginTime);
        } else {
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('loginTime', loginTime);
        }
  
        navigate('/');
      } else {
        notifications.show({
          title: 'Login failed',
          message: 'Invalid credentials',
          color: 'red',
          styles: () => ({
            root: {
              position: 'fixed',
              top: 100,
              left: '70%',
              transform: 'translateX(-50%)',
              width: 'auto',
              maxWidth: '60%',
            },
          }),
        });
      }
      setLoading(false);
    }, 1000);
  };
  

  return (
    <Container size={420} my={40}>
      <Center mb={30}>
        <Image 
          src={cartoonSchool} 
          alt="School Logo" 
          width={80} 
          height={80} 
          fallbackSrc="https://png.pngtree.com/png-clipart/20210929/original/pngtree-school-building-illustration-png-image_6867457.png"
        />
      </Center>
      
      <Title ta="center" fw={700}>
        School Vaccination Portal
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Coordinator Login
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Email"
              placeholder="your@email.com"
              leftSection={<IconAt style={{ width: rem(16), height: rem(16) }} />}
              {...form.getInputProps('email')}
              required
            />
            
            <PasswordInput
              label="Password"
              placeholder="Your password"
              leftSection={<IconLock style={{ width: rem(16), height: rem(16) }} />}
              {...form.getInputProps('password')}
              required
            />
            
            <Group justify="space-between" mt="lg">
              <Checkbox
                label="Remember me"
                {...form.getInputProps('remember', { type: 'checkbox' })}
              />
              <Anchor component="button" size="sm">
                Forgot password?
              </Anchor>
            </Group>
            
            <Button 
              fullWidth 
              mt="xl" 
              type="submit"
              loading={loading}
              gradient={{ from: 'violet', to: 'purple', deg: 90 }}
              variant="gradient"
            >
              Sign in
            </Button>
          </Stack>
        </form>
      </Paper>
      
      <Box mt={40}>
        <Text c="dimmed" size="sm" ta="center">
          © {new Date().getFullYear()} School Vaccination System. All rights reserved.
        </Text>
      </Box>
    </Container>
  );
}