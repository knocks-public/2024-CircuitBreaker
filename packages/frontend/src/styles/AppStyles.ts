import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    marginVertical: 8,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  camera: {
    flex: 1,
    width: '100%',
    aspectRatio: 1,
  },
  switch: {
    marginVertical: 10,
    alignSelf: 'center',
  },
  verificationResult: {
    fontSize: 18,
    color: 'black',
    margin: 20,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 8,
  },
});
