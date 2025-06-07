import { ColorModeButton } from "@/components/ui/color-mode";
import { Button, Container, Stack, Text } from "@chakra-ui/react";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");
  return (
    <Container maxW="5xl">
      <Stack>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          {t("avendi")}
        </Text>
        <Button borderRadius={"lg"} loadingText={t("loading")}>
          {t("save")}
        </Button>
        <ColorModeButton />
      </Stack>
    </Container>
  );
}
