"use client";

import {
  Button,
  Card,
  Fieldset,
  Icon,
  Input,
  Separator,
  Stack,
  Text,
  Link,
  Box,
} from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { PasswordInput } from "../ui/password-input";
import { useTranslations } from "next-intl";
import { FcGoogle } from "react-icons/fc";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations("auth-pages");

  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    setIsLoading(false);

    if (error) {
      toaster.create({
        title: "Login Failed",
        description: error.message,
        type: "error",
        duration: 5000,
      });
    } else {
      toaster.create({
        title: "Login Successful",
        description: "Redirecting...",
        type: "success",
        duration: 3000,
      });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card.Root borderRadius="lg" variant="outline">
        <Card.Header>
          <Card.Title>{t("sign-in")}</Card.Title>
          <Card.Description>{t("form-description")}</Card.Description>
        </Card.Header>
        <Card.Body>
          <Fieldset.Root>
            <Stack gap={4} align="stretch">
              <Field
                label={t("email")}
                invalid={!!errors.email}
                errorText={errors.email?.message}
              >
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="you@example.com"
                  borderRadius="lg"
                />
              </Field>

              <Field
                label={t("password")}
                invalid={!!errors.password}
                errorText={errors.password?.message}
              >
                <PasswordInput
                  {...register("password")}
                  placeholder="••••••••"
                  borderRadius="lg"
                />
              </Field>
            </Stack>
          </Fieldset.Root>
        </Card.Body>
        <Card.Footer>
          <Stack w="full" gap={4}>
            <Button
              type="submit"
              loading={isLoading}
              loadingText={t("signing-in")}
              borderRadius="lg"
              w="full"
            >
              {t("sign-in")}
            </Button>
            <Button
              type="button"
              loading={isLoading}
              loadingText={t("signing-in")}
              borderRadius="lg"
              w="full"
              variant="outline"
            >
              <Icon>
                <FcGoogle />
              </Icon>
              {t("sign-in-with-google")}
            </Button>
            <Separator my={4} />
            <Box textAlign="center" mb={2}>
              <Text fontSize="sm" color="gray">
                {t("not-signed-up-yet")}{" "}
                <Link href="/sign-up" variant="underline">
                  {t("create-account")}
                </Link>
              </Text>
            </Box>
          </Stack>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}
