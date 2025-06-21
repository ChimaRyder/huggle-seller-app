import Toast from 'react-native-toast-message';

export const showToast = (type: 'success' | 'error', title: string, description: string) => {
    Toast.show({ 
        type,
        text1: title,
        text2: description,
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        topOffset: 30,
        bottomOffset: 40,
    });
};