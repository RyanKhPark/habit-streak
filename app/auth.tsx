import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { GradientBackground } from "../components/GradientBackground";
import { useTimeBasedTheme } from "../hooks/useTimeBasedTheme";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const timeTheme = useTimeBasedTheme();
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }

      router.replace("/");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: timeTheme.primaryText }]}
            variant="headlineMedium"
          >
            {" "}
            {isSignUp ? "Create Account" : "Welcome Back"}
          </Text>

          <TextInput
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="example@gmail.com"
            mode="flat"
            style={styles.input}
            onChangeText={setEmail}
            textColor={timeTheme.primaryText}
            placeholderTextColor={timeTheme.placeholderText}
            underlineColor={timeTheme.inputBorder}
            activeUnderlineColor={timeTheme.primaryButton}
            theme={{
              colors: {
                onSurfaceVariant: timeTheme.primaryText,
                primary: timeTheme.primaryButton,
                surfaceVariant: timeTheme.inputBackground,
                background: timeTheme.inputBackground,
                surface: timeTheme.inputBackground,
                onSurface: timeTheme.primaryText,
              },
            }}
          />

          <TextInput
            label="Password"
            autoCapitalize="none"
            mode="flat"
            secureTextEntry
            style={styles.input}
            onChangeText={setPassword}
            textColor={timeTheme.primaryText}
            placeholderTextColor={timeTheme.placeholderText}
            underlineColor={timeTheme.inputBorder}
            activeUnderlineColor={timeTheme.primaryButton}
            theme={{
              colors: {
                onSurfaceVariant: timeTheme.primaryText,
                primary: timeTheme.primaryButton,
                surfaceVariant: timeTheme.inputBackground,
                background: timeTheme.inputBackground,
                surface: timeTheme.inputBackground,
                onSurface: timeTheme.primaryText,
              },
            }}
          />

          {error && (
            <Text style={{ color: timeTheme.errorColor }}> {error}</Text>
          )}

          <Button
            mode="contained"
            style={styles.button}
            onPress={handleAuth}
            buttonColor={timeTheme.primaryButton}
            textColor={timeTheme.primaryButtonText}
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>

          <Button
            mode="text"
            onPress={handleSwitchMode}
            style={styles.switchModeButton}
            textColor={timeTheme.secondaryButtonText}
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    borderRadius: 8,
  },
  button: {
    marginTop: 8,
  },
  switchModeButton: {
    marginTop: 16,
  },
});
