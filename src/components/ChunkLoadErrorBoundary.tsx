import { Box, Button, Typography } from "@mui/material";
import { type ReactNode, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface Props {
  children: ReactNode;
}

const isChunkError = (error: Error): boolean => {
  return (
    error.name === "ChunkLoadError" ||
    error.message.includes("Loading chunk") ||
    error.message.includes("dynamically imported module") ||
    error.message.includes("ChunkLoadError")
  );
};

const ChunkErrorFallback = ({ error }: { error: Error }) => {
  const [retryCount] = useState(() => {
    // Get retry count from sessionStorage to persist across page refreshes
    const stored = sessionStorage.getItem("chunkErrorRetryCount");
    return stored ? Number.parseInt(stored, 10) : 0;
  });
  const chunkError = isChunkError(error);
  const maxRetries = 3;

  useEffect(() => {
    if (chunkError && retryCount < maxRetries) {
      console.log(
        `Chunk loading error detected, refreshing page... (attempt ${
          retryCount + 1
        }/${maxRetries})`
      );
      // Increment retry count and store in sessionStorage
      const newRetryCount = retryCount + 1;
      sessionStorage.setItem("chunkErrorRetryCount", newRetryCount.toString());
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } else if (chunkError && retryCount >= maxRetries) {
      console.log("Max retries reached for chunk loading error");
      // Clear retry count after max retries
      sessionStorage.removeItem("chunkErrorRetryCount");
    }
  }, [chunkError, retryCount, maxRetries]);

  const handleRefresh = () => {
    // Clear retry count on manual refresh
    sessionStorage.removeItem("chunkErrorRetryCount");
    window.location.reload();
  };

  if (chunkError && retryCount < maxRetries) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        padding={3}
      >
        <Typography variant="h6" gutterBottom>
          Loading new version...
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          The application has been updated. Refreshing to load the latest
          version.
          {retryCount > 0 && ` (Attempt ${retryCount + 1}/${maxRetries})`}
        </Typography>
      </Box>
    );
  }

  if (chunkError && retryCount >= maxRetries) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="200px"
        padding={3}
      >
        <Typography variant="h6" gutterBottom>
          Failed to load application
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          textAlign="center"
        >
          Unable to load the latest version after {maxRetries} attempts. Please
          refresh manually.
        </Typography>
        <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
          Refresh Page
        </Button>
      </Box>
    );
  }

  // For other errors, show a manual refresh option
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
      padding={3}
    >
      <Typography variant="h6" gutterBottom>
        Oops! Algo deu errado.
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        gutterBottom
        textAlign="center"
      >
        Um erro inesperado ocorreu. Por favor, tente atualizar a página.
      </Typography>
      <Button variant="contained" onClick={handleRefresh} sx={{ mt: 2 }}>
        Recarregue a página
      </Button>
    </Box>
  );
};

const ChunkLoadErrorBoundary = ({ children }: Props) => {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    console.error("ChunkLoadErrorBoundary caught an error:", error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={ChunkErrorFallback}
      onError={handleError}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export { ChunkLoadErrorBoundary };
