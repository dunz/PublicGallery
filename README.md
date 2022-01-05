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

