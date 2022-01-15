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

`lib/users.js`

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

`lib/users.js`

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

### 9.4 포스트 목록 조회하기

`lib/posts.js`

```js
const postsCollection = firestore().collection('posts');
export async function getPosts({userId, mode, id} = {}) {
  const snapshot = await postsCollection.get();
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return posts;
}
```

`postsCollection.get()`로 포스트가 저장되었을 당시의 스냅샷 목록데이터를 가져온 후에 각 객체에 id를 추가하여 반환해준다

### 9.4.3 FeedScreen에서 getPost 호출 후 FlatList로 보여주기

### 9.4.4 페이지네이션 및 시간순 정렬하기

### 9.4.4.1 정렬 및 불러오는 수 제한하기

`lib/posts.js`

```jsx
export const PAGE_SIZE = 3;
export async function getPosts({userId, mode, id} = {}) {
  const snapshot = await postsCollection
    .orderBy('createdAt', 'desc')
    .limit(PAGE_SIZE)
    .get();
  const posts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
  return posts;
}
```

### 9.4.4.2 포스트 더 불러오기

`lib/posts.js`
```js
const cursorDoc = await postsCollection.doc(id).get();
const snapshot = await postsCollection
.orderBy('createdAt', 'desc')
.startAfter(cursorDoc)
.limit(PAGE_SIZE)
.get();
```

- .startAfter(cursorDoc): cursorDoc 를 제외한 이후의 데이터 조회 
- .startAt(cursorDoc): cursorDoc 를 포함한 이후의 데이터 조회

`screens/FeedScreen.js`
```jsx
const [noMorePost, setNoMorePost] = useState(false);

useEffect(() => {
  getPosts().then(setPosts);
}, []);

const onLoadMore = async () => {
  if (noMorePost || !posts || posts.length < PAGE_SIZE) {
    return;
  }
  const lastPost = posts[posts.length - 1];
  const olderPosts = await getOlderPosts(lastPost.id);
  if (olderPosts.length < PAGE_SIZE) {
    setNoMorePost(true);
  }
  setPosts(posts.concat(olderPosts));
};

return (
  <FlatList
    data={posts}
    renderItem={renderItem}
    keyExtractor={item => item.id}
    contentContainerStyle={styles.container}
    onEndReached={onLoadMore}
    onEndReachedThreshold={0.75}
    ListFooterComponent={
      !noMorePost && (
        <ActivityIndicator style={styles.spinner} size={32} color="#6200ee" />
      )
    }
  />
);
```

- onEndReached: 스크롤 하단으로 내릴때 호출되는 이벤트
- onEndReachedThreshold: 스크롤 하단 이벤트가 실행될 거리 입력
- ListFooterComponent: 리스트의 하단에 노출해줄 컴포넌트

### 9.4.4.3 최근 작성한 포스트 불러오기

`lib/posts.js`
```js
const cursorDoc = await postsCollection.doc(id).get();
const snapshot = await postsCollection
.orderBy('createdAt', 'desc')
.endBefore(cursorDoc)
.limit(PAGE_SIZE)
.get();
```

- .endBefore(cursorDoc): cursorDoc 를 제외한 이전의 데이터 조회
- .endAt(cursorDoc): cursorDoc 를 포함한 이전의 데이터 조회

`screens/FeedScreen.js`
```jsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  if (!posts || posts.length === 0 || refreshing) {
    return;
  }
  const firstPost = posts[0];
  setRefreshing(true);
  const newerPosts = await getNewerPosts(firstPost.id);
  setRefreshing(false);
  if (newerPosts.length === 0) {
    return;
  }
  setPosts(newerPosts.concat(posts));
};

return (
  <FlatList
    ...
    refreshControl={
      <RefreshControl refreshing={onRefresh} onRefresh={onRefresh} />
    }
  />
);
```

- RefreshControl: `react-native`에서 제공하는 상단에서 내렸을때 반응하는 컨트롤 컴포넌트, `refreshing`, `onRefresh` 둘다 필요

### 9.5 사용자 프로필 화면 구현하기

### 9.5.1 Firestore 데이터 조회할 때 조건 추가하기

`lib/posts.js`
```js
const snapshot = await postsCollection
...
.where('user.id', '==', userId)
.get();
```

### 9.5.2 포스트 조회 함수 리팩토링하기

### 9.5.3 Firestore에서 색인 추가하기
특정 조건이나 정렬로 사용하는 키를 색인으로 만들어야 한다 (성능최적화 관점)

### 9.5.4 Profile 컴포넌트 만들기

`Profile`을 공용으로 만든 후 `ProfileScreen`과 `MyProfileScreen`에서 사용

### 9.5.5 그리드 뷰 만들기
화면 3가로 3분한을 위해 `demensions` 활용

```jsx
const dimensions = useWindowDimensions();
const size = (dimensions.width - 3) / 3;

return (
<Pressable
  onPress={onPress}
  style={({pressed}) => [
    {
      opacity: pressed ? 0.6 : 1,
      width: size,
      height: size,
    },
    styles.block,
  ]}>
  <Image
    style={styles.image}
    source={{uri: post.photoURL}}
    resizeMethod="resize"
    resizeMode="cover"
  />
</Pressable>
);
```

### 9.5.6 페이지네이션 구현하기

### 9.5.7 커스텀 Hook을 작성해 컴포넌트 리팩토링하기

### 9.5.8 포스트 열기

`screens/PostScreen.js`

```jsx
<ScrollView contentContainerStyle={styles.contentContainer}>
  <PostCard
    user={post.user}
    photoURL={post.photoURL}
    description={post.description}
    createdAt={post.createdAt}
    id={post.id}
  />
</ScrollView>
```

텍스트가 길어질 경우 스크롤을 발생시키기 위해 `ScrollView`사용

### 9.5.9 내 프로필 화면 구현하기
`useNavigationState`를 사용해 현재 네비게이션에 대한 정보를 가져올수있다

```jsx
const routeNames = useNavigationState(state => state.routeNames);
```

### 9.6 포스트 수정 및 삭제 기능 구현하기

더보기 버튼 추가

```jsx
<Pressable hitSlop={8}>
  <Icon name="more-vert" size={20} />
</Pressable>
```

- hitSlop:(number | {bottom: number, left: number, right: number, top: number})  
컴포넌트가 차지하는 영역은 그대로 유지하고 터치할수 있는 영역만 각 방향으로 지정한 수치만큼 늘려준다

### 9.6.1 재사용할 수 있는 모달 만들기

### 9.6.2 사용자에게 수정 및 삭제 물어보기

`usePostActions` 커스텀 훅 추가 

### 9.6.3 포스트 삭제 기능 구현하기

`lib/posts.js`

```js
export function removePost(id) {
  return postsCollection.doc(id).delete();
}
```

### 9.6.4 포스트 설명 수정 기능 구현하기

`lib/posts.js`
```js
export function updatePost({id, description}) {
  return postsCollection.doc(id).update({
    description,
  });
}
```

### 9.7 EventEmitter로 다른 화면 간 흐름 제어하기

### 9.7.1 EventEmitter3 설치 및 적용하기
```shell
$ yarn add eventemitter3
```

### 9.7.2 포스트 작성 후 업데이트하기

이벤트 등록 및 해제 처리 하기 
```js
useEffect(() => {
  events.addListener('refresh', onRefresh);
  return () => {
    events.removeListener('refresh', onRefresh);
  };
}, [onRefresh]);
```

매번 두벌씩 해제 코드를 넣어주는게 귀찮다. 그래서 한단계 더 나아가서 `events.addListener('refresh', onRefresh);`코드가 해제 리스너를 리턴하도록 하자.
그러기 위해서는 이벤트 등록후 해제를 리턴해주는 별도의 함수를 만든다

```js
export const addListener = (eventName, callback) => {
  events.addListener(eventName, callback);  // 이벤트 등록 실행
  return () => {    // 이벤트 해제 실행 함수를 리턴
    events.removeListener(eventName, callback);
  };
};
```
`eventName, callback`중복 코드가 발생하고 3, 4 번째 인자 대응 안되있기에 개선하면서 동시에 간소화 처리

```js
export const addListener = (...params) => {
  events.addListener(...params);
  return events.removeListener.bind(events, ...params);
};
```

호출해주는 `useEffect` 부분 변경

```js
useEffect(() => {
  const removeListener = addListener('refresh', onRefresh);
  return () => {
    removeListener();
  };
}, [onRefresh]);
```

조금더 간소화를 해보자

```js
useEffect(() => addListener('refresh', onRefresh), [onRefresh]);
```

끝

### 9.7.3 포스트 삭제 후 목록에서 제거하기

`hooks/usePostActions.js`
```js
const remove = async () => {
  await removePost(id);

  // 현재 단일 포스트 조회 화면이라면 뒤로가기
  if (route.name === 'Post') {
    navigation.pop();
  }

  events.emit('removePost', id);
};
```

`screens/FeedScreen.js`, `components/Profile.js`
```jsx
useEffect(() => {
  const removeRefresh = addListener('refresh', onRefresh);
  const removeRemovePost = addListener('removePost', removePost);
  return () => {
    removeRefresh();
    removeRemovePost();
  };
}, [onRefresh]);
```

### 9.7.4 리팩토링하기

`useEffect`를 실행해주는 `usePostsEventEffect`훅 만들기

`hooks/usePostsEventEffect.js`
```js
import {useEffect} from 'react';
import {addListener} from '../lib/events';

export const usePostsEventEffect = ({
  refresh,
  removePost,
  updatePost,
  enabled,
}) => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const removeRefresh = addListener('refresh', refresh);
    const removeRemovePost = addListener('removePost', removePost);
    return () => {
      removeRefresh();
      removeRemovePost;
    };
  }, [refresh, removePost, updatePost, enabled]);
};
```

`usePosts`훅에서 `usePostsEventEffect`훅을 호출
`hooks/usePosts.js`
```jsx
export const usePosts = userId => {
  ...
  usePostsEventEffect({
    refresh: onRefresh,
    removePost,
    enabled: !userId || userId === user.id,
  });
}
```

### 9.7.5 포스트 수정 후 업데이트하기

### 9.8 설정화면 만들기

`screens/ SettingScreen.js`
```jsx
import React from 'react';
import {StyleSheet, View, Text, Pressable, Platform} from 'react-native';
import {useUserContext} from '../contexts/UserContext';
import {signOut} from '../lib/users';

export const SettingScreen = () => {
  const {setUser} = useUserContext();

  const onLogout = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <View style={styles.block}>
      <Pressable
        onPress={onLogout}
        style={({pressed}) => [
          styles.item,
          pressed && Platform.select({ios: {opacity: 0.5}}),
        ]}
        android_ripple={{
          color: '#eee',
        }}>
        <Text>로그아웃</Text>
      </Pressable>
    </View>
  );
};
```

### 9.9 Firestore 보안 설정하기

```
match /posts/{post} {
  allow get;                                                            // 단일 조회 모두 허용
  allow list;                                                           // 리스트 조회 모두 허용
  allow create: if request.resource.data.user.id == request.auth.uid    // 요청 들어온 post 데이터의 user.id와 로그인한 유저의 uid 비교
  allow delete, update: if resource.data.user.id == request.auth.uid    // 저장된 post 데이터의 user.id와 로그인한 유저의 uid 비교
}
match /users/{user} {
  allow read;                                 // read는 get과 list를 포함하는 권한
  allow write: if request.auth.uid == user;   // write는 create, update, delete를 포함하는 권한
}
```

### 9.10 Splash 화면 만들기

Splash화면은 앱을 구돈한 후 필요한 로딩이 끝날 때까지 전체화면을 가리는 화면

#### Android 설정

```shell
$ yarn add react-native-splash-screen
```
1. `http://bit.ly/publicgallery-splash`경로에서 압축파일 다운로드
2. 안드로이드 폴더안에있는 폴더들을 `android/app/src/main/res` 경로에 복사
3. `android/app/src/main/java/com/publicgallerydunz/MainActivity.java` 파일에 코드 추가
4. ```java
    import android.os.Bundle;
    import org.devio.rn.splashscreen.SplashScreen;
    ...
    @Override
    protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);  // here
    super.onCreate(savedInstanceState);
    }
    ```
5. `android/app/src/main/res/layout/launch_screen.xml` 파일 추가
6. ```xml
   <?xml version="1.0" encoding="utf-8"?>
    <RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:layout_centerInParent="false"
    android:layout_centerHorizontal="true"
    android:layout_centerVertical="true"
    android:background="#6200EE"
    android:gravity="center_vertical"
    android:orientation="vertical">
    
        <ImageView
            android:id="@+id/imageView"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:src="@drawable/splash_icon" />
    </RelativeLayout>
  ```

안드로이드 레이아웃 시스템 가이드
https://developer.android.com/guide/topics/ui/declaring-layout

#### IOS 설정

1. `ios/PublicGalleryDunz/AppDelegate.m` 파일에 코드 추가
2. Xcode로 `ios/PublicGalleryDunz.xcworkspace` 열기
3. 좌측 사이드바의 `Image.xcassets`을 선택 후 내부에 + 누른뒤 `ImageSet` 누르기
4. UI에서 Image를 더블클릭해 이름 변경하기
5. 3개의 빈박으에 앞에서 내려받은 이미지들을 `splash_icon`, `splash_icon@2x`, `splash_icon@3x` 순서로 드래그앤 드롭하기
6. 좌측 사이드바의 `LaunchScreen.styroboard` 선택하기
7. 내부에서 View Controller Scene, View Controller, View를 펼치기
8. 우측상단의 +누르고 Image View를 View 폴더 내부로 드래그앤 드롭하기
9. Image View에서 PublicGAllery<닉네임>, Powered by React Native 지우기
10. 가운데 이미지 선택 후 우측 상단의 Image 속성애서 만든 SplashIcon 선택하기
11. 하단의 직사각형 두개 있는 아이콘을 누르고 Horizontally in Container, Vertically in Container를 0으로 정한후 Add 2 Constraints 눌러서 가운데 정렬하기
12. 내부의 View 선택 후 Background 속성에서 Custom 지정후 나타난 팔레트에서 두번째 탭에 Hex Color 값에 `6200ee`입력하여후 Enter 쳐서 배경색 맞추기
13. `command` + `S`를 눌러 저장후 `yarn ios`로 ios 앱 다시 구동하기  

`ios/PublicGalleryDunz/AppDelegate.m`
```m
#import <RNSplashScreen.h>
...
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif
[RNSplashScreen show];
return YES;
```

### 9.10.3 원하는 시점에 Splash 화면 숨기기

`screens/RootStack.js`
```jsx
import SplashScreen from 'react-native-splash-screen';
...
useEffect(() => {
  const unsubscribe = subscribeAuth(async currentUser => {
    unsubscribe();
    if (!currentUser) {
      SplashScreen.hide();
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

`screens/FeedScreen.js`
```jsx
const {posts, noMorePost, onLoadMore, onRefresh} = usePosts();

const postsReady = posts !== null;
useEffect(() => {
  if (postsReady) {
    SplashScreen.hide();
  }
}, [postsReady]);
```
