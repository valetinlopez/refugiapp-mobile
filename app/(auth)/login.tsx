import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Refugiapp</Text>
      <Text style={styles.subtitle}>Iniciar sesion</Text>
      <Link href="/register" style={styles.link}>
        No tienes cuenta? Registrate
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    opacity: 0.6,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    color: '#007AFF',
  },
});
