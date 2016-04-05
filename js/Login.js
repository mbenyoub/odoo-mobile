'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Image,
  Modal,
  TouchableHighlight,
  TouchableWithoutFeedback,
  DeviceEventEmitter,
  UIManager,
  NativeModules,
  AlertIOS,
} from 'react-native';
  
const dismissKeyboard = require('dismissKeyboard')

class Login extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      HOSTName: '',
      DBName: '',
      UserName: '',
      Password: '',
    };
    
    NativeModules.PreferenceModule.getUserDefault('HostName', (v) => {
      this.setState({HOSTName : v});
    });
    NativeModules.PreferenceModule.getUserDefault('DBName', (v) => {
      this.setState({DBName : v});
    });
    NativeModules.PreferenceModule.getUserDefault('UserName', (v) => {
      this.setState({UserName : v});
    });
    NativeModules.PreferenceModule.getKeyChain('Password', (v) => {
      this.setState({Password : v});
    });
  }
  
  render() {
    return (
      <ScrollView
        ref='Container'
        keyboardShouldPersistTaps={true}
        keyboardDismissMode='on-drag'
        contentContainerStyle={styles.contentStyle}>
        <TouchableWithoutFeedback onPress={()=>dismissKeyboard()}>
          <View style={styles.container}>
            <Text style={styles.title}>
              登录
            </Text>
            <Image
              style={styles.logo}
              source={require('image!logo')} />
            <TextInput
              style={styles.input}
              ref='HOSTName'
              value={this.state.HOSTName}
              clearButtonMode={'while-editing'}
              onChange={this.onHOSTNameChanged.bind(this)}
              placeholder='请输入服务器地址'/>
            <TextInput
              style={styles.input}
              ref='DBName'
              value={this.state.DBName}
              clearButtonMode={'while-editing'}
              onChange={this.onDBNameChanged.bind(this)}
              placeholder='请输入数据库名称'/>
            <TextInput
              style={styles.input}
              ref='UserName'
              value={this.state.UserName}
              clearButtonMode={'while-editing'}
              onChange={this.onUserNameChanged.bind(this)}
              placeholder='请输入您的用户名'/>
            <TextInput
              style={styles.input}
              ref='Password'
              value={this.state.Password}
              secureTextEntry={true}
              clearButtonMode={'while-editing'}
              onChange={this.onPasswordChanged.bind(this)}
              placeholder='请输入您的密码'/>
            <TouchableHighlight
              style={styles.button}
              onPress={this.onLogin.bind(this)}
              underlayColor='#99d9f4'>
              <Text style={styles.buttonText}>登  录</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={styles.button}
              underlayColor='#99d9f4'>
              <Text style={styles.buttonText}>申  请</Text>
            </TouchableHighlight>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    );
  }
  
  componentDidMount() {
　　DeviceEventEmitter.addListener('keyboardWillShow', (f) => this.onKeyboardWillShown(f));
　　DeviceEventEmitter.addListener('keyboardWillHide', (f) => this.onKeyboardWillHidden());
　　DeviceEventEmitter.addListener('kLoginNetworkNotification', (f) => this.onLoginResponse(f));
  }

  componentWillUnmount() {
　　DeviceEventEmitter.removeAllListeners('keyboardWillShow');
　　DeviceEventEmitter.removeAllListeners('keyboardWillHide');
　　DeviceEventEmitter.removeAllListeners('kLoginNetworkNotification');
  }
  
  onKeyboardWillShown(keyboardEvent) {
    this.refs.HOSTName.measure((ox, oy, width, height, px, py) => {
      this.refs.Container.scrollTo({x:0, y:oy-20, animated: true});
    });
  }
  
  onKeyboardWillHidden() {
    this.refs.Container.scrollTo({x:0, y:0, animated: true});
  }

  
  onHOSTNameChanged(event) {
    this.setState({ HOSTName: event.nativeEvent.text });
  }
  
  onDBNameChanged(event) {
    this.setState({ DBName: event.nativeEvent.text });
  }
  
  onUserNameChanged(event) {
    this.setState({ UserName: event.nativeEvent.text });
  }
  
  onPasswordChanged(event) {
    this.setState({ Password: event.nativeEvent.text });
  }
  
  onLogin() {
    dismissKeyboard();
      
    NativeModules.HUD.popWaiting('');

    this.setState({ isLogining: true});
    NativeModules.OdooModule.authenticate(this.state.HOSTName, this.state.DBName, this.state.UserName, this.state.Password, (success, failedReason, userID) => {
      NativeModules.HUD.dismissWaiting();

      if( success ) {
        NativeModules.PreferenceModule.setUserDefault('HostName', this.state.HOSTName);
        NativeModules.PreferenceModule.setUserDefault('DBName', this.state.DBName);
        NativeModules.PreferenceModule.setUserDefault('UserName', this.state.UserName);
        NativeModules.PreferenceModule.setKeyChain('Password', this.state.Password);
        
        this.onGetUserGroup(userID);
      }
      else {
        NativeModules.HUD.popError(failedReason);
      }
    });
  }
  
  onGetUserGroup(userID) {
    NativeModules.HUD.popWaiting('');
    
    NativeModules.OdooModule.execute('res.groups', 'search', [[['users', 'in', userID]]], {}, (success, failedReason, groupIDs) => {
      NativeModules.HUD.dismissWaiting();
      
      if( success ) {
        this.onGetMenu(groupIDs);
      }
      else {
        NativeModules.HUD.popError(failedReason);
      }
    });
  }
  
  onGetMenu(groupIDs) {
    NativeModules.HUD.popWaiting('');
    
    NativeModules.OdooModule.execute('ir.ui.menu', 'search_read', [[['groups_id', 'in', groupIDs]]], {'fields': ['id', 'parent_id', 'web_icon_data', 'action', 'name']}, (success, failedReason, menus) => {
      NativeModules.HUD.dismissWaiting();
      
      if( success ) {
        NativeModules.PreferenceModule.set('menus', menus);
      }
    });
  }
}

const styles = StyleSheet.create({
  description: {
    marginBottom: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#656565'
  },
  container: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'stretch',
    alignSelf: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  contentStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    padding: 7,
    fontSize: 20,
    flexDirection: 'row',
    textAlign: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  logo: {
    width: 217,
    height: 138,
    marginTop: 30,
    marginBottom: 30,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    flex: 1,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  },
  input: {
    height: 36,
    padding: 4,
    marginBottom: 10,
    flex: 1,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#48BBEC',
    borderRadius: 8,
    // color: '#48BBEC'
  }
});

AppRegistry.registerComponent('Login', () => Login);