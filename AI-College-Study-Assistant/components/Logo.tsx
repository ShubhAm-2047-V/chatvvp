import { StyleSheet, View, Text, Image } from 'react-native';
import { Fonts } from '@/constants/theme';

interface LogoProps {
  size?: number;
  textColor?: string;
  style?: any;
}

/**
 * Reusable 'Chat.VVP' Logo component using the new branding.
 */
export const Logo: React.FC<LogoProps> = ({ size = 40, textColor = '#333', style }) => {
  return (
    <View style={[styles.container, style]}>
      <Image 
        source={require('@/assets/images/logo.png')} 
        style={{ width: size, height: size, borderRadius: 8 }}
        resizeMode="contain"
      />
      <View>
        <Text style={[styles.text, { fontSize: size * 0.5, color: '#0a7ea4' }]}>
          CHAT. VVP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    // Matching the web dashboard's primary color
  },
  text: {
    fontWeight: '700',
    fontFamily: Fonts.rounded,
  },
});
