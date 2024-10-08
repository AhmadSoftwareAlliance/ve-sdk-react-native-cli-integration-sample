import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  Platform,
  NativeModules,
  TouchableOpacity
} from 'react-native';
const {SdkEditorModule} = NativeModules;

// Set Banuba license token for Video and Photo Editor SDK
const LICENSE_TOKEN = "Qk5CIOMXKz95GM9NcnqCl4gyB8sNWoEB6Gygm0T4eMafG5hV1UYtpp6MxgK583StZtVF9W53wlX843aVCVG8/vopwSaKvNB4Rqfm2viyFWJb18v3ZjTImhfkS/XIKzY4kWQvnPgpn5xoi6K1/GMAqJ+wSBEcPwy0acYgbATa0MKqTffUAJABfsYCL3ozHbgYqyS37ko0RyQyzmRHZSV/r9Gw/v0xqeo4DjME/22vNnfW+EMVdPic2HOZD561LJ4AgvVzngidwa4qTsPj4+yBZxR2Z0/MdGdYVFUejCDs6cMW95/Y7mSwnjJEgRuPhoVicWmlrLqwkEGBvJ8ebzYADCi8EY1jplbDODl79WyvWIzNJgRJiWtiyXZ9/etOpS5hkujPVftEO6w493R15NAXui6m3jzowEuz3VOVRUzquzyysX80lKE9qWidJ9UOpLGHMuwMg6nb4NdcfvI32Vuf+nNGywTejr4QtlfrEYI/FZqbpge5sMmlM5pYQfwSkR/DvXTktsXiP+9e6OD46aQhzU5wh0JzshZLF1PU+Du5bPvOMND1n//tXV1N5nnEv5mjoinmHnT7D2MrO9oH/StaFczblGq/WW/tdbjKcoY/WEURXnTXbDZ+SzyTHWyes3JsWmGsOxLRXmOYCU3QQpv5EuykIKpj4DwFwdgjQyTTuO2J15lH9X0pFdrVBCZZ0ACd7u9rA6XbrcLoB8EJ7sCkadsQdWPt8Fl4rdlQeshopcSqP/N1d7wXXkpYh3kCQzQKN/UJkVejDQfWXeetXJVPFP2emg1ltT1YAjGHmyTwBbBPb3bEkAH9b4hGRgp+82gQVu58QDd5XU7J40xWORWJyoVN2sFZ111bFoXKMIlyK9DfL9BH5uU2R8VZ17HPDr6M/bdW0QmerzYvCu8nvUuz/Rg/8s6sMUWyXIRW8HOMjgPDzjDW9w2bO6smPgZ5pSw7R8MY+0+XASLpoUsj8BKn3MJKoI0RXIxsXUv4fY+gNaVavgcTDep0CxUOUWV7Ew/9QNT8yoESf7qZYRHUr0Rz4FhIKic8zOUrOpXeF4SKhv7s1Y709gNnZ51SkoLHsZgaLomhNRyov1jBRdef+5YAmYUU1y/eSA0/bQBnFIw1c1ABGtRHMP1/3N72oBR3h13ihvbGaRA6FEnmKDjSlAf2oA4mGyQwYDKWVcseG660naTZVhEINUfqpu2NxfMd5yJrrKcBNiciRuQ5YSNwINOhnUg9O2byyKAi8ju+oQX/nyezKKzxX4uCRQhYR8JDCD3HZjHpkZ8ry0GKPYfM5lP1BbrEnZKbiVs9dghk/TDxYB8gxreWAjI/a97Idp5vcNKJiytup72kHJsxirysdAJYVIdwr6EYj9v+S0VoJuMHDoHqkQE4BQJZxvU3qrnM/YL1JPXqQLYxGmti7G69SCvEAzoP158jZyqpTRunV9V0KjrvSNivmCK3vzcdPXNh9fwiGlstIFQbAJ+fd3q/9meghZOLQUuNQeqToeBg0wm55b3jnUptrPHLSCkjq767EkGNV7gnOwJ4c0yLtASblNGtXqybh23oxSoznraaGKDtPArq3ilUG3la6kAPG3QqTcAztLoGPzECe4YnH54u1g7yoWQkeJ+V6dPqvQwRAqH994iLCQLuBCPy/dfzVmytlmpQay6jt4rqeRWFY3OBL6IG/QfSvqWUZGIZEDUuCGK/PINPwj2MqsmI/FO7KkIse2jwSD7vrSx69qFQTS0Gh7hkIA4al7yh80R+6frd4y8="

function initVideoEditorSDK() {
  SdkEditorModule.initVideoEditorSDK(LICENSE_TOKEN);
}

function initPhotoEditorSDK() {
  SdkEditorModule.initPhotoEditorSDK(LICENSE_TOKEN);
}

async function openVideoEditor() {
  initVideoEditorSDK();
  return await SdkEditorModule.openVideoEditor();
}

async function openVideoEditorPIP() {
  initVideoEditorSDK();
  return await SdkEditorModule.openVideoEditorPIP();
}

async function openVideoEditorTrimmer() {
  initVideoEditorSDK();
  return await SdkEditorModule.openVideoEditorTrimmer();
}

async function openPhotoEditor() {
  if (Platform.OS === 'android') {
    SdkEditorModule.releaseVideoEditor();
  }
  SdkEditorModule.initPhotoEditorSDK(LICENSE_TOKEN);
  return await SdkEditorModule.openPhotoEditor();
}

export default class App extends Component {
  
  constructor() {
    super();
    this.state = {
      errorText: '',
    };
  }

  handleVideoExport(response) {
    console.log('Export completed successfully: video = ' + response?.videoUri + '; videoPreview = '
        + response?.previewUri);
  }

  handleSdkError(e) {
    console.log('handle sdk error = ' + e.code);

    var message = '';
    switch (e.code) {
      case 'ERR_SDK_NOT_INITIALIZED':
        message = 'Banuba Video Editor SDK is not initialized: license token is unknown or incorrect.\nPlease check your license token or contact Banuba';
        break;
      case 'ERR_SDK_EDITOR_LICENSE_REVOKED':
        message = 'License is revoked or expired. Please contact Banuba https://www.banuba.com/support';
        break;
      case 'ERR_MISSING_EXPORT_RESULT':
        message = 'Missing video export result!';
      case 'ERR_CODE_NO_HOST_CONTROLLER':
        message = "Host Activity or ViewController does not exist!";
      case 'ERR_VIDEO_EXPORT_CANCEL':
        message = "Video export is canceled";
      default:
        message = '';
        console.log(
        'Banuba ' +
          Platform.OS.toUpperCase() +
          ' Video Editor export video failed = ' +
            e,
          );
        break;
    }
    this.setState({ errorText: message });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            Sample integration of Banuba Video and Photo Editor into React Native
          </Text>
        </View>

        <View style={styles.buttonsWrapper}>
          <View style={styles.buttonsContainer}>
            {this.state.errorText ? (
              <Text style={styles.errorText}>{this.state.errorText}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.button, styles.photoButton]}
              onPress={async () => {
                  openPhotoEditor()
                    .then(response => console.log('Exported photo = ' + response?.photoUri))
                    .catch(e => this.handleSdkError(e));
              }}
            >
              <Text style={styles.buttonText}>Open Photo Editor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                openVideoEditor()
                  .then(response => this.handleVideoExport(response))
                  .catch(e => this.handleSdkError(e));
              }}
            >
              <Text style={styles.buttonText}>Open Video Editor - Default</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                openVideoEditorPIP()
                  .then(response => this.handleVideoExport(response))
                  .catch(e => this.handleSdkError(e));
              }}
            >
              <Text style={styles.buttonText}>Open Video Editor - PIP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                openVideoEditorTrimmer()
                  .then(response => this.handleVideoExport(response))
                  .catch(e => this.handleSdkError(e));
              }}
            >
              <Text style={styles.buttonText}>Open Video Editor - Trimmer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  headerContainer: {
    height: '33%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  buttonsWrapper: {
    position: 'absolute',
    top: 50,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    marginVertical: 8,
  },
  photoButton: {
    backgroundColor: '#00ab41',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});