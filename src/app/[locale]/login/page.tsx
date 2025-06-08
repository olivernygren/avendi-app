import LoginForm from "@/components/login/login-form";
import { Box, Container, Stack } from "@chakra-ui/react";

export default function LoginPage() {
  return (
    <Box bg="gray.50" w="100%" h="100vh">
      <Container maxW="xl" h="100vh">
        <Stack gap={4} justifyContent="center" h="100vh">
          <LoginForm />
        </Stack>
      </Container>
    </Box>
  );
}
