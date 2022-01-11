## 8. Firebase로 사진 공유 앱 만들기
- Firebase 연동하기
- 회원 인증 구현하기
- 사진 선택 및 업로드하기

### 8.1 프로젝트 준비하기

```sh
npx react-native init PublicGallery
```

### 8.1.1 내비게이션과 아이콘 설정하기
```sh
yarn add @react-navigation/native react-native-screens react-native-safe-area-context @react-navigation/native-stack @react-navigation/bottom-tabs react-native-vector-icons
```
스택 네비게이션 적용

`screens/RootStack.js`
```js
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

export const RootStack = () => {
  <Stack.Navigator>{/*temp*/}</Stack.Navigator>;
};
```

`App.js`
```js
import React from 'react';
import type {Node} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {RootStack} from './screens/RootStack';

const App: () => Node = () => {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
};

export default App;
```

벡터 아이콘 적용

`ios/PublicGalleryDunz/Info.plist`
```plist
...
<key>UIAppFonts</key>
<array>
    <string>MaterialIcons.ttf</string>
</array>
```

`app/build.gradle`
```gradle
...
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### 8.1.2 Fireabse 적용하기
`https://firebase.google.com/`

프로젝트 만들기

### 8.1.2.1 안드로이드에 Fireabse 적용하기
Android 앱 추가

- Android 패키지 이름: com.publilerydunz
- 앱 닉네임: PublicGallery
- 디버그 서명 인증서 SHA-1

프로젝트 루트에서
```sh
keytool -J-Duser.language=en -list -v -alias androiddebugkey -keystore ./android/app/debug.keystore
```
입력 후 `Certificate fingerprints:`의 `SHA1:` 부분 확인후 입력한 후 앱 등록

`google-services.json`파일을 다운받아 `android/app` 경로에 에 저장

`android/build.gradle`파일에 코드 추가
```gradle
classpath 'com.google.gms:google-services:4.3.10'
```

`android/app/build.gradle`파일에 코드 추가
```gradle
apply plugin: 'com.google.gms.google-services'
...
android {
    defaultConfig {
        ...
        multiDexEnabled true
    }
}
...
dependencies {
    implementation platform('com.google.firebase:firebase-bom:29.0.3')
...
}
```

### 8.1.2.2 IOS에 Fireabse 적용하기
IOS 앱 추가

번들 아이디 확인하기

- Xcode로 ios/PublicGalleryDunz.xcworkspace 파일 열기
- 좌측 PublicGalleryDunz -> General -> Target/PublicGalleryDunz -> Bundle Identifier

- 번들아이디: org.reactjs.native.example.PublicGalleryDunz
- 앱 닉네임: PublicGallery
- 앱스토어 ID: (생략, 앱스토어 등록하지 않을거라 불필요)

`GoogleService-Info.plist`파일을 다운받아 `ios/PublicGalleryDunz` 경로에 저

3, 4번 절차는 React Native Firebase 로 대체하기에 생략

### 8.1.2.3 React Native Firebase

React Native Firebase 설치 사전 작업

`ios/PublicGalleryDunz/AppDelegate.m` 에 코드추가

```m
#import <Firebase.h>
...

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif
...
if([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
...
```
`if([FIRApp defaultApp] == nil) {` 해당 코드를 삽입 시 알수없는 이유로 ios 앱이 꺼지는 버그 발생

**해결방법**: `GoogleService-Info.plist`추가시 xcode로 `PublicGalleryDunz.xcworkspace`를 연 후에 xcode에서 `GoogleService-Info.plist`를 해당 경로에 추가해주어야 시뮬레이터에서 인식한다

> https://ychcom.tistory.com/entry/Exception-NSException-FIRApp-configure-FirebaseAppconfigure-in-Swift-could-not-find-a-valid-GoogleService-Infoplist-in-your-project

React Native Firebase 설치 (https://rnfirebase.io)
```shell
yarn add @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/storage
```
- @react-native-firebase/app: 필수 라이브러리
- @react-native-firebase/auth: 회원 인증 시 사용
- @react-native-firebase/firestore: 실시간 데이터베이스
- @react-native-firebase/storage: 이미지 업로드

### 8.1.3 화면 구성 이해하기

### 8.2 회원 인증 구현하기

### 8.2.1 회원 인증을 위한 UI 준비하기

### 8.2.1.1 rest 연산자와 spread 연산자로 모든 Props 그대로 넘겨주기

`screens/SignInScreen.js`

```jsx
export const SignInScreen = () => {
  return (
    <SafeAreaView style={styles.fullscreen}>
      ...
        <BorderedInput hasMarginBottom placeholder="이메일" />
        <BorderedInput placeholder="비밀번호" />
      ...
    </SafeAreaView>
  );
};
```

`components/BorderedInput.js`

```jsx
export const BorderedInput = ({hasMarginBottom, ...rest}) => {
  return (
    <TextInput
      style={[styles.input, hasMarginBottom && styles.margin]}
      {...rest}
    />
  );
};
```

### 8.2.1.2 CustomButton에 Secondary 버튼 스타일 만들기

### 8.2.1.3 라우트 파라미터로 회원가입 화면 만들기

`screens/SignInScreen.js`

```jsx
import { useState } from "react";
import { KeyboardAvoidingView } from "react-native";

export const SignInScreen = ({ navigation, route }) => {
  const { isSignUp } = route.params ?? {};

  return (
    <SafeAreaView style={styles.fullscreen}>
      <Text style={styles.text}>PublicGallery</Text>
      <View style={styles.form}>
        <BorderedInput hasMarginBottom placeholder="이메일" />
        <BorderedInput placeholder="비밀번호" hasMarginBottom={isSignUp} />
        {isSignUp && <BorderedInput placeholder="비밀번호 확인" />}
        <View style={styles.buttons}>
          {isSignUp ? (
            <>
              <CustomButton title="회원가입" hasMarginBottom />
              <CustomButton
                title="로그인"
                theme="secondary"
                onPress={() => navigation.goBack()}
              />
            </>
          ) : (
            <>
              <CustomButton title="로그인" hasMarginBottom />
              <CustomButton
                title="회원가입"
                theme="secondary"
                onPress={() => navigation.push('SignIn', { isSignUp: true })}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};
```

### 8.2.2 인풋 상태 관리하기

`screens/SignInScreen.js`

```jsx
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Keyboard, Platform, StyleSheet, Text, View} from 'react-native';
import {BorderedInput} from '../components/BorderedInput';
import {CustomButton} from '../components/CustomButton';
import KeyboardAvoidingView from 'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView';

export const SignInScreen = ({navigation, route}) => {
  const {isSignUp} = route.params ?? {};

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const createChangeTextHandler = name => value => {
    setForm({...form, [name]: value});
  };

  const onSubmit = () => {
    Keyboard.dismiss();
    console.log(form);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.select({ios: 'padding'})}>
      <SafeAreaView style={styles.fullscreen}>
        <Text style={styles.text}>PublicGallery</Text>
        <View style={styles.form}>
          <BorderedInput
            hasMarginBottom
            placeholder="이메일"
            value={form.email}
            onChangeText={createChangeTextHandler('email')}
            autoCapitalize="none"
            autoCorrect={false}
            autoCompleteType="email"
            keyboardType="email-address"
          />
          <BorderedInput
            placeholder="비밀번호"
            hasMarginBottom={isSignUp}
            value={form.password}
            onChangeText={createChangeTextHandler('password')}
            secureTextEntry
          />
          {isSignUp && (
            <BorderedInput
              placeholder="비밀번호 확인"
              value={form.confirmPassword}
              onChangeText={createChangeTextHandler('confirmPassword')}
              secureTextEntry
            />
          )}
          <View style={styles.buttons}>
            {isSignUp ? (
              <>
                <CustomButton
                  title="회원가입"
                  hasMarginBottom
                  onPress={onSubmit}
                />
                <CustomButton
                  title="로그인"
                  theme="secondary"
                  onPress={() => navigation.goBack()}
                />
              </>
            ) : (
              <>
                <CustomButton
                  title="로그인"
                  hasMarginBottom
                  onPress={onSubmit}
                />
                <CustomButton
                  title="회원가입"
                  theme="secondary"
                  onPress={() => navigation.push('SignIn', {isSignUp: true})}
                />
              </>
            )}
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};
```

- autoCapitalize="none": IOS 첫글자 대문자 기능 비활성화
- autoCorrect={false}: IOS 자동수정 비활성화
- autoCompleteType="email": 이메일 자동완성 키보드
  keyboardType="email-address": 이메일 자동완성 키보드
- secureTextEntry: 텍스트 마스킹

### 8.2.3 인풋에서 키보드 리턴 처리하기

- returnKeyType="next" | "done": 키보드 return 버튼 설정
- onSubmitEditing: 키보드 return 버튼 터치 시 동작 핸들러

### 8.2.4 컴포넌트 분리하기

### 8.2.5 Firebase로 회원 인증하기

> https://rnfirebase.io/auth/usage

firebase의 auth 모듈을 이용해서 각 함수 만들기

`lib/auth.js`

```js
import auth from '@react-native-firebase/auth';

export const signIn = ({email, password}) =>
  auth().signInWithEmailAndPassword(email, password);

export const signUp = ({email, password}) =>
  auth().createUserWithEmailAndPassword(email, password);

export const subscribeAuth = callback => auth().onAuthStateChanged(callback);

export const signOut = () => auth().signOut();
```

onSubmit 핸들러 구현

`screens/SignInScreen.js`

```jsx
const onSubmit = async () => {
  Keyboard.dismiss();
  const {email, password} = form;
  const info = {email, password};
  setLoading(true);
  try {
    const {user} = isSignUp ? await signUp(info) : await signIn(info);
    console.log('user', user);
  } catch (e) {
    Alert.alert('실패');
    console.log(e);
  } finally {
    setLoading(false);
  }
};
```

`react-native`의 `ActivityIndicator` 컴포넌트로 스피너 만들기 

`components/SignButtons.js`

```jsx
if (loading) {
  return (
    <View style={styles.spinnerWrapper}>
      <ActivityIndicator size={32} color="#6200ee" />
    </View>
  );
}
...
const styles = StyleSheet.create({
  ...
  spinnerWrapper: {
    marginTop: 64,
    height: 104,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

### 8.2.6 오류 예외 처리하기

firebase auth 에러코드

> https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth `error codes` 부분 확인

`screens/SignInScreen.js`

```jsx
const onSubmit = async () => {
  Keyboard.dismiss();
  const {email, password, confirmPassword} = form;

  if (isSignUp && password !== confirmPassword) {
    return Alert.alert('실패', '비밀번호가 일치하지 않습니다.');
  }

  setLoading(true);
  const info = {email, password};

  try {
    const {user} = isSignUp ? await signUp(info) : await signIn(info);
    console.log('user', user);
  } catch (e) {
    const messages = {
      'auth/email-already-in-use': '이미 가입된 이메일입니다.',
      'auth/wrong-password': '잘못된 비밀번호입니다.',
      'auth/user-not-found': '존재하지 않는 계정입니다.',
      'auth/invalid-email': '유효하지 않은 이메일 주소입니다.',
    };
    const msg = messages[e.code] || `${isSignUp ? '가입' : '로그인'} 실패`;
    Alert.alert('실패', msg);
  } finally {
    setLoading(false);
  }
};
```

### 8.2.7 사용자 프로필 Firestore에 담기

`lib/auth.js`

```jsx
import firestore from '@react-native-firebase/firestore';

export const userCollection = firestore().collection('user');

...
export const createUser = ({id, displayName, photoURL}) => {
  return userCollection.doc(id).set({
    id,
    displayName,
    photoURL,
  });
};

export const getUser = async id => {
  const doc = userCollection.doc(id).get();
  return doc.data();
};
```

### 8.3 Firebase에 회원 정보 등록하기

`screens/WelcomeScreen.js`

```jsx
import React from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SetupProfile} from '../components/SetupProfile';

export const WelcomeScreen = () => {
  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.select({ios: 'padding'})}>
      <SafeAreaView style={styles.block}>
        <Text style={styles.title}>환영합니다</Text>
        <Text style={styles.description}>프로필을 설정하세요.</Text>
        <SetupProfile />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  block: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
  },
  description: {
    marginTop: 16,
    fontSize: 21,
    color: '#757575',
  },
});
```

`components/SetupProfile.js`

```jsx
import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {createUser, signOut} from '../lib/auth';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {BorderedInput} from './BorderedInput';
import {CustomButton} from './CustomButton';

export const SetupProfile = () => {
  const [displayName, setDisplayName] = useState('');
  const navigation = useNavigation();

  const {params} = useRoute();
  const {uid} = params || {};

  const onSubmit = () => {
    createUser({id: uid, displayName, photoURL: null});
  };

  const onCancel = () => {
    signOut();
    navigation.goBack();
  };

  return (
    <View style={styles.block}>
      <View style={styles.circle} />
      <View style={styles.form}>
        <BorderedInput
          placeholder="닉네입"
          value={displayName}
          onChangeText={setDisplayName}
          onSubmitEditing={onSubmit}
          returnKeyType="next"
        />
        <View style={styles.buttons}>
          <CustomButton title="다음" onPress={onSubmit} hasMarginBottom />
          <CustomButton title="취소" onPress={onCancel} theme="secondary" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  circle: {
    backgroundColor: '#cdcdcd',
    borderRadius: 64,
    width: 128,
    height: 128,
  },
  form: {
    marginTop: 16,
    width: '100%',
  },
  buttons: {
    marginTop: 48,
  },
});
```

`screens/SignInScreen.js`

```jsx
export const SignInScreen = ({route, navigation}) => {
  ...
  const onSubmit = async () => {
    ...
    try {
      const {user} = isSignUp ? await signUp(info) : await signIn(info);
      const profile = await getUser(user.uid);
      if (profile) {
      } else {
        navigation.navigate('Welcome', {uid: user.uid});
      }
    }
    ...
  };
};
```

### UserContext 만들고 로그인 사용자 분기 처리하기

`context/UserContext.js`

```jsx
import React, {createContext, useContext, useState} from 'react';

const UserContext = createContext(null);

export const UserContextProvider = ({children}) => {
  const [user, setUser] = useState(null);

  return <UserContext.Provider children={children} value={{user, setUser}} />;
};

export const useUserContext = () => {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext.Provider is not foud');
  }
  return userContext;
};
```

`screens/RootStack.js`

```jsx
export const RootStack = () => {
  const {user} = useUserContext();

  return (
    <Stack.Navigator>
      {user ? (
        // Stack.Screen MainTab
      ) : (
        // Stack.Screen SignIn
        // Stack.Screen Welcome
      )}
    </Stack.Navigator>
  );
};
```

로그인 완료 후 MainTab이 보여야 한다 MainTab이동시 navigate 또는 Push의 경우 뒤로가기로 로그인페이지 접근 문제가 있기 때문에

user 상태에 따라 Stack Navigator의 스크린을 분기 시켜준다

> 정상이동은 되나 ERROR  Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function. 발생

### 8.5 이미지 업로드하기

네이티브 이미지 선택 라이브러리 설치

```shell
$ yarn add react-native-image-picker
```

사전 설정 및 권한 허용 설정

`android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

`ios/PublicGalleryDunz/Info.plist`

```plist
<key>NSPhotoLibraryUsageDescription</key>
<string>$(PRODUCT_NAME) would like access to your photo gallery</string>
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) would like to use your camera</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>$(PRODUCT_NAME) would like to save photos your photo gallery</string>
```

사용법

`import {launchCemera, launchImageLibrary} from 'react-native-image-picker'`

`launchCemera(options, callback)`

`launchImageLibrary(options, callback)`: 

시뮬레이터에 이미지 받아놓기

> `https://picsum.photos/500`

프로필 이미지 영억을 이미지 컴포넌트로 채워준다

`components/SetupProfile.js`

```jsx
import {launchImageLibrary} from 'react-native-image-picker';

export const SetupProfile = () => {
  ...
  const [response, setResponse] = useState(null);

  const onSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        includeBase64: Platform.OS === 'android',
      },
      res => {
        if (res.didCancel) {
          return;
        }
        setResponse(res);
      },
    );
  };

  return (
    <View style={styles.block}>
      <Pressable onPress={onSelectImage}>
        <Image
          style={styles.circle}
          source={
            response
              ? {uri: response?.assets[0]?.uri}
              : require('../assets/user.png')
          }
        />
      </Pressable>
    </View>
  );
};
```

### 8.5.3 Firebase Storage로 이미지 업로드하기

IOS와 안드로이드의 업로드 방식이 조금 다르다

- IOS: uri에서 파일을 불러와서 바로 업로드
- 안드로이드: putString을 통해 base64로 인코딩된 데이터를 업로드

`components/SetupProfile.js`

```jsx
import storage from '@react-native-firebase/storage';

const onSubmit = async () => {
  setLoading(true);
  let photoURL = null;

  if (response) {
    const asset = response.assets[0];
    const extension = asset.fileName.split('.').pop();
    const reference = storage().ref(`/profile/${uid}.${extension}`);

    if (Platform.OS === 'android') {
      await reference.putString(asset.base64, 'base64', {
        contentType: asset.type,
      });
    } else {
      await reference.putFile(asset.uri);
    }

    photoURL = await reference.getDownloadURL();
  }

  const user = {id: uid, displayName, photoURL};
  createUser(user);
  setUser(user);
};
```
## 9 Firebase로 사진 공유 앱 만들기2

### 9.1 탭화면 구현하기
- RootStack
  - MainTab
    - HomeStack
      - FeedScreen
    - MyProfileStack
      - MyProfileScreen
  - SignInScreen
  - WelcomeScreen

### 9.2 로그인 상태 유지하기
- 로그인 상태를 유지해주기 위해서 현재 Firebase로 인증을 구현했기 때문에 AsyncStorage를 사용할 필요가 없다
- onAuthStateChanged 함수의 인자에는 인증상태가 바뀔때마다 호출하고 싶은 콜백함수를 넣는다

`screens/RootStack.js`

```jsx
useEffect(() => {
  const unsubscribe = subscribeAuth(async currentUser => {
    unsubscribe();
    if (!currentUser) {
      return;
    }
    const profile = await getUser(currentUser.uid);
    if (!profile) {
      return;
    }
    setUser(profile);
  });
}, [setUser]);
```

### 9.3 포스트 작성 기능 구현하기

### 9.3.2 업로드할 사진 선택 또는 카메라 촬영하기
- IOS: ActionSheetIOS를 통해 선택
- 안드로이드: 선택 모달 만들기

### 9.3.2.1 모달 만들기
react-native 모달을 만들때는 주로 Modal 이라는 컴포넌트를 사용한다

Modal컴포넌트
- visible: 컴포넌트 보이고 숨기기 여부
- animationType: 애니메이션 효과, 'slide' | 'fade' | 'none'(default)
- transparent: 배경 투명도, 기본은 흰색배경
- onRequestClose: 안드로이드에서 뒤로가기 액션시 호출되는 함수

### 9.3.2.2 ActionSheetIOS로 선택하기

### 9.3.2.3 react-native-image-picker 사용하기

### 9.3.3 포스트 작성 화면 만들기

- 이미지 선택시 RootStack 하위의 UploadScreen 페이지로 이동
- 키보드 올라올때를 캐치해서 이미지 height 애니메이션 주어 줄이기

`screens/UploadScreen.js`

```jsx
import { Animated, Keyboard } from 'react-native';
...

const animation = useRef(new Animated.Value(width)).current;
useEffect(() => {
  const didShow = Keyboard.addListener('keyboardDidShow', () =>
    setIsKeyboardOpen(true),
  );
  const didHide = Keyboard.addListener('keyboardDidHide', () =>
    setIsKeyboardOpen(false),
  );

  return () => {
    didShow.remove();
    didHide.remove();
  };
}, []);

useEffect(() => {
  Animated.timing(animation, {
    toValue: isKeyboardOpen ? 0 : width,
    useNativeDriver: false,
    duration: 150,
    delay: 100,
  }).start();
}, [isKeyboardOpen, width, animation]);

...
return (
        <Animated.Image
          source={{uri: res?.assets?.[0]?.uri}}
          style={[styles.image, {height: animation}]}
          resizeMode="cover"
        />
)
```

### 9.3.4 Firestore에 포스트 등록하기

`lib/posts.js`
```jsx
import firestore from '@react-native-firebase/firestore';

const postsCollection = firestore().collection('posts');

export function createPost({user, photoURL, description}) {
  return postsCollection.add({
    user,         //UserContext에 담긴 현재 사용자 정보 객체
    photoURL,     // 업로드할 이미지 주소
    description,  // 이미지에 대한 설명 텍스트
    createdAt: firestore.FieldValue.serverTimestamp(), // 서버측에서 해당 데이터의 값을 지정해줌
  });
}
```

파일명 변환하기 위해 라이브러리 설치
> react-native에서 uuid 라이브러리가 작동하려면 사전에 react-native-random-values를 index.js에서 불러와야 한다

```shell
$ yarn add uuid react-native-get-random-values
$ npx pod-install
```

firebase storage에 이미지 업로드 후에 store에 post 등록

```jsx
import storage from '@react-native-firebase/storage';
import {v4} from 'uuid';
import {createPost} from '../lib/posts';

...

const onSubmit = useCallback(async () => {
  navigation.pop();
  const asset = res.assets[0];

  const extension = asset.fileName.split('.').pop();
  const reference = storage().ref(`/photo/${user.id}/${v4()}.${extension}`);
  if (Platform.OS === 'android') {
    await reference.putString(asset.base64, 'base64', {
      contentType: asset.type,
    });
  } else {
    await reference.putFile(asset.uri);
  }
  const photoURL = await reference.getDownloadURL();
  await createPost({description, photoURL, user});
}, [res, user, description, navigation]);
```
