import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  StyledEngineProvider,
  ThemeProvider,
  Toolbar,
  Typography,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import theme from "./theme";
import { useMemo, useState, useEffect } from "react";
import { FileService, UploadConfig } from "./services/file.service";
import { FileUpload } from "./components/FileUpload";
import { Login } from "./components/Login";
import { AuthService, User } from "./services/auth.service";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [files, setFiles] = useState<Array<{
    key: string;
    originalname: string;
    size: number;
  }>>([]);
  const [uploadConfig, setUploadConfig] = useState<UploadConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fileService = useMemo(function initFileService() {
    return new FileService();
  }, []);

  const loadData = async () => {
    if (!isLoggedIn) return;
    
    console.log('Loading data - starting API calls...');
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching upload config...');
      const configData = await fileService.getUploadConfig();
      console.log('Upload config loaded:', configData);
      
      console.log('Fetching files list...');
      const filesData = await fileService.getFiles();
      console.log('Files list loaded:', filesData);
      
      setUploadConfig(configData);
      setFiles(filesData);
      console.log('Data loading completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Failed to load data - Error details:', {
        error: err,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is already logged in on app start
    const currentUser = AuthService.getCurrentUser();
    if (currentUser && currentUser.isLoggedIn) {
      setUser(currentUser);
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                BonusX Interview Challenge
              </Typography>
              {isLoggedIn ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2">
                    Ciao, {user?.username}!
                  </Typography>
                  <Button color="inherit" onClick={handleLogout}>
                    Logout
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="inherit">
                  Non autenticato
                </Typography>
              )}
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
            
              <Grid size={12}>
                {isLoggedIn ? (
                  <FileUpload 
                    files={files}
                    uploadConfig={uploadConfig}
                    loading={loading}
                    error={error}
                    onFilesChange={setFiles}
                    onRefresh={loadData}
                  />
                ) : (
                  <>
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Devi effettuare il login per accedere ai file e alle funzioni di upload.
                    </Alert>
                    <Login onLogin={handleLogin} />
                  </>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;