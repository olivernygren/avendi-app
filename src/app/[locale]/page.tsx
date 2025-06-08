"use client";

import { ColorModeButton } from "@/components/ui/color-mode";
import { createClient } from "@/utils/supabase/client";
import { Button, Container, Stack, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const t = useTranslations("common");
  const supabase = createClient();
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <Container maxW="5xl">
      <Stack>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          {t("avendi")}
        </Text>
        <Button borderRadius={"lg"} loadingText={t("loading")}>
          {t("save")}
        </Button>
        <Button
          borderRadius={"lg"}
          loadingText={t("loading")}
          onClick={signOut}
          colorPalette="red"
        >
          {t("sign-out")}
        </Button>
        <ColorModeButton />
      </Stack>
    </Container>
  );
}
