import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { getUserDetails } from '../utils/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../Module/Constants/Colors';
import { CopyableTouchableOpacity } from './CopyableControl';
// import { ImageBackground } from 'react-native';

const { width } = Dimensions.get('window');

// function to calculate number of columns dynamically
const getNumColumns = () => {
  if (width >= 900) return 4; // tablet big screen
  if (width >= 600) return 3; // medium devices
  return 2; // default mobile
};

const tradeRoutes = new Set([
  'applylicense',
  'applylicensesummary',
  'search',
  'inboxscreen',
  'tradedetails',
  'docupload',
  'renewlicense',
  'renewlicensepage',
  'surrenderlicense',
  'surrenderlicensepage',
  'inboxdtls',
  'amedment',
  'amedmentsummery',
]);

const removeTradeMenuItems = items =>
  items.flatMap(item => {
    const url = String(item.url ?? '').trim().toLowerCase();
    if (/\btrade\b/i.test(item.name) || tradeRoutes.has(url)) {
      return [];
    }

    if (!item.children?.length) {
      return [item];
    }

    const children = removeTradeMenuItems(item.children);
    return children.length ? [{ ...item, children }] : [];
  });

const MenuTreeScreen = () => {
  const [menuStack, setMenuStack] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMenuTree = async () => {
      try {
        const userDetails = await getUserDetails();
        if (userDetails && userDetails?.menuTree) {
          setMenuStack([removeTradeMenuItems(userDetails.menuTree)]);
        }
      } catch (err) {
        console.log('Error fetching menu:', err);
      }
    };
    fetchMenuTree();
  }, []);

  const getIconName = iconName => {
    const glyphs = Icon.getRawGlyphMap?.() || Icon.glyphMap;
    return glyphs && glyphs[iconName] ? iconName : 'dashboard';
  };

  const currentMenu = menuStack[menuStack.length - 1] || [];

  const handlePress = item => {
    if (item.children?.length) {
      setMenuStack([...menuStack, item.children]);
    } else {
      console.log('item:', item.name);
      navigation.navigate(item.url); // use screen name
    }
  };

  const goBack = () => {
    if (menuStack.length > 1) {
      setMenuStack(menuStack.slice(0, -1));
    } else {
      navigation.goBack();
    }
  };

  const renderItem = ({ item }) => (
    <CopyableTouchableOpacity style={styles.box} onPress={() => handlePress(item)}>
      <View style={styles.iconContainer}>
        <Icon name={getIconName(item.icon)} size={40} style={styles.icon} />
      </View>
      <Text style={styles.boxText}>{item.name}</Text>

      {/* {item.children?.length ? (
        <Icon
          name="chevron-right"
          size={24}
          color="#666"
          style={{ marginTop: 8 }}
        />
      ) : null} */}
    </CopyableTouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        {menuStack.length > 1 ? (
          <CopyableTouchableOpacity style={styles.backButton} onPress={goBack}>
            <Icon name="arrow-back" size={24} color="#090748ff" />
            <Text style={styles.headerText}>Back</Text>
          </CopyableTouchableOpacity>
        ) : (
          <Text selectable style={styles.headerText}>Menu</Text>
        )}
      </View>

      {/* FlatList with no ScrollView wrapping */}
      <FlatList
        data={currentMenu}
        keyExtractor={(item, index) =>
          item?.id ? `${item.id}-${index}` : `${item.name}-${index}`
        }
        renderItem={renderItem}
        numColumns={getNumColumns()}
        contentContainerStyle={styles.scrollContainer}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        // if needed for nested navigation screens
        nestedScrollEnabled={false}
        ListEmptyComponent={
          <Text selectable style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
            No menu items found
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default MenuTreeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 10,
    marginTop: 10,
    borderWidth: 2, // 👈 border thickness
    borderColor: Colors.primary, // 👈 border color (light gray)
  },
  headerText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContainer: {},
  box: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: '#fdfdfd',
    paddingHorizontal: 25,
    // minHeight: 70,
    maxWidth: (width - 20) / getNumColumns(),
  },

  iconContainer: {
    marginBottom: 2,
  },
  boxText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#019499ff',
    textAlign: 'center',
  },
  icon: {
    color: Colors.primary,
  },
});
