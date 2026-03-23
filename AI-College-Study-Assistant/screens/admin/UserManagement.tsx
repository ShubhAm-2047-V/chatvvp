import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Dimensions,
  RefreshControl,
  Animated,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BackgroundWrapper } from '../../components/BackgroundWrapper';
import { THEME_COLORS, PIXEL_SHADOWS } from '../../constants/theme';
import Card from '../../components/Card';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

export default function UserManagement() {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const searchBoxAnim = useRef(new Animated.Value(0)).current;
  const searchBoxSlide = useRef(new Animated.Value(20)).current;

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    Animated.parallel([
      Animated.timing(searchBoxAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(searchBoxSlide, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [searchBoxAnim, searchBoxSlide]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Confirm Deletion',
      `This will permanently remove ${name} from the platform.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete User', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/delete-user/${id}`);
              setUsers(users.filter(u => u._id !== id));
            } catch (error) {
              Alert.alert('Error', 'Action failed. Please try again.');
            }
          }
        }
      ]
    );
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const UserItem = ({ item, index }: any) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => {
        setSelectedUser(item);
        setIsModalVisible(true);
      }}
    >
      <Card translucent style={styles.itemWrapper} delay={200 + index * 100}>
        <View style={styles.userMainRow}>
        <View style={[styles.avatar, { backgroundColor: item.role === 'admin' ? THEME_COLORS.primary : THEME_COLORS.accent }]}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDelete(item._id, item.name)}
          style={styles.deleteIcon}
        >
          <Ionicons name="trash-bin-outline" size={18} color="#f43f5e" />
        </TouchableOpacity>
      </View>

      <View style={styles.userMetaRow}>
        <View style={[styles.badge, item.role === 'admin' ? styles.adminBadge : styles.roleBadge]}>
          <Text style={[styles.badgeText, item.role === 'admin' ? styles.adminText : styles.roleText]}>
            {item.role.toUpperCase()}
          </Text>
        </View>
        <View style={styles.branchBox}>
          {item.branch && (
            <Text style={styles.branchText}>{item.branch} · Yr {item.year}</Text>
          )}
          {item.subject && (
            <Text style={styles.branchText}>{item.subject}</Text>
          )}
        </View>
      </View>
    </Card>
    </TouchableOpacity>
  );

  const renderUserModal = () => (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={90} tint="light" style={styles.modalBlur}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setIsModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={THEME_COLORS.secondary} />
            </TouchableOpacity>

            <View style={[styles.modalAvatar, { backgroundColor: selectedUser?.role === 'admin' ? THEME_COLORS.primary : THEME_COLORS.accent }]}>
              <Text style={styles.modalAvatarText}>{selectedUser?.name?.[0]}</Text>
            </View>

            <Text style={styles.modalName}>{selectedUser?.name}</Text>
            <Text style={styles.modalEmail}>{selectedUser?.email}</Text>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Role</Text>
              <View style={[styles.badge, selectedUser?.role === 'admin' ? styles.adminBadge : styles.roleBadge]}>
                <Text style={[styles.badgeText, selectedUser?.role === 'admin' ? styles.adminText : styles.roleText]}>
                  {selectedUser?.role?.toUpperCase()}
                </Text>
              </View>
            </View>

            {selectedUser?.branch && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Branch</Text>
                <Text style={styles.detailValue}>{selectedUser.branch}</Text>
              </View>
            )}

            {selectedUser?.year && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year</Text>
                <Text style={styles.detailValue}>{selectedUser.year}</Text>
              </View>
            )}

            {selectedUser?.subject && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>{selectedUser.subject}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.modalActionBtn}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.modalActionText}>Done</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );

  return (
    <BackgroundWrapper noSafeArea>
      <View style={styles.content}>
        <View style={styles.headerSpacer} />
        <Animated.View style={[styles.searchBox, { opacity: searchBoxAnim, transform: [{ translateY: searchBoxSlide }] }]}>
          <BlurView intensity={80} tint="light" style={styles.searchInner}>
            <Ionicons name="search" size={18} color={THEME_COLORS.primary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Filter by name or email..."
              placeholderTextColor={THEME_COLORS.textLight}
              value={search}
              onChangeText={setSearch}
            />
          </BlurView>
        </Animated.View>

        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLORS.primary} style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item, index }) => <UserItem item={item} index={index} />}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME_COLORS.primary} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color={THEME_COLORS.border} />
                <Text style={styles.emptyText}>No matching accounts found</Text>
              </View>
            }
          />
        )}
      </View>

      {renderUserModal()}

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddUser')}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSpacer: {
    height: 50,
  },
  searchBox: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: THEME_COLORS.secondary,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 100,
  },
  itemWrapper: {
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME_COLORS.primary + '30'
  },
  userMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    ...PIXEL_SHADOWS.card
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  userEmail: {
    fontSize: 12,
    color: THEME_COLORS.textLight,
    marginTop: 2,
    fontWeight: '600'
  },
  deleteIcon: {
    padding: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)'
  },
  userMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  adminBadge: {
    backgroundColor: THEME_COLORS.primary + '20',
    borderColor: THEME_COLORS.primary,
  },
  roleBadge: {
    backgroundColor: THEME_COLORS.accent + '20',
    borderColor: THEME_COLORS.accent,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  adminText: {
    color: THEME_COLORS.primary,
  },
  roleText: {
    color: THEME_COLORS.accent,
  },
  branchBox: {
    flex: 1,
    alignItems: 'flex-end',
  },
  branchText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME_COLORS.textLight,
    textTransform: 'uppercase'
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: THEME_COLORS.textLight,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: THEME_COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
    ...PIXEL_SHADOWS.card
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBlur: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: THEME_COLORS.primary,
    ...PIXEL_SHADOWS.card
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000',
    ...PIXEL_SHADOWS.card
  },
  modalAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
    textAlign: 'center',
  },
  modalEmail: {
    fontSize: 14,
    color: THEME_COLORS.textLight,
    marginTop: 4,
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: THEME_COLORS.border,
    marginVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME_COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME_COLORS.secondary,
  },
  modalActionBtn: {
    marginTop: 10,
    backgroundColor: THEME_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000',
    ...PIXEL_SHADOWS.card,
    width: '100%',
    alignItems: 'center'
  },
  modalActionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
