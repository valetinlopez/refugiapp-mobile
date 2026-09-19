import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>
      <Link href="/login" style={styles.link}>
        Ya tienes cuenta? Inicia sesion
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
    marginBottom: 24,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    color: '#007AFF',
  },
});
