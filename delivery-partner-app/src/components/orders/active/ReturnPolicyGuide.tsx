import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, FontSize, Shadow, BorderRadius, Spacing } from '../../../utils/theme';
import { authAPI } from '../../../api/services';

interface ReturnPolicyGuideProps {
  items: any[];
  isVerified: boolean;
  onVerifiedChange: (verified: boolean, media: { url: string; publicId: string }[], notes: string) => void;
  onFail?: () => void;
}

export const ReturnPolicyGuide = ({ items, isVerified, onVerifiedChange, onFail }: ReturnPolicyGuideProps) => {
  const [images, setImages] = useState<{ url: string; publicId: string }[]>([]);
  const [localUris, setLocalUris] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState('');
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const pickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Limit Reached', 'You can upload up to 4 images.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos of the returned item.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      handleUpload(uri);
    }
  };

  const handleUpload = async (uri: string) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('file', { uri, name: filename, type } as any);

      const response = await authAPI.uploadFile(formData);
      const newImages = [...images, response];
      setImages(newImages);
      setLocalUris([...localUris, uri]);
      
      // Auto-call parent if already verified status is being tracked
      checkCompletion(newImages, notes, checks);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUris = localUris.filter((_, i) => i !== index);
    setImages(newImages);
    setLocalUris(newUris);
    checkCompletion(newImages, notes, checks);
  };

  const toggleCheck = (id: string) => {
    const newChecks = { ...checks, [id]: !checks[id] };
    setChecks(newChecks);
    checkCompletion(images, notes, newChecks);
  };

  const checkCompletion = (currentImages: any[], currentNotes: string, currentChecks: Record<string, boolean>) => {
    const allChecked = Object.values(currentChecks).every(v => v === true);
    const hasImages = currentImages.length >= 1;
    onVerifiedChange(allChecked && hasImages, currentImages, currentNotes);
  };

  const handleNotesChange = (text: string) => {
    setNotes(text);
    checkCompletion(images, text, checks);
  };

  // Dynamically generate conditions if present in policy, otherwise fallback
  const policyConditions = items?.[0]?.product?.returnPolicy?.conditions || [];
  const conditionMap: Record<string, { label: string; emoji: string }> = {
    'UNUSED': { label: 'इस्तेमाल नहीं किया गया', emoji: '🧥' },
    'ORIGINAL_PACKAGING': { label: 'ओरिजिनल पैकेजिंग', emoji: '📦' },
    'WITH_TAGS': { label: 'टैग और लेबल', emoji: '🏷️' },
    'ANY': { label: 'साफ सुथरा', emoji: '✨' },
  };

  const displayConditions = policyConditions.length > 0 
    ? policyConditions.map((c: string) => ({ id: c, label: `${conditionMap[c]?.label || c} ${conditionMap[c]?.emoji || ''}` }))
    : [
        { id: 'packaging', label: 'ओरिजिनल पैकेजिंग 📦' },
        { id: 'tags', label: 'टैग और लेबल 🏷️' },
        { id: 'clean', label: 'साफ और कोई नुकसान नहीं ✨' },
        { id: 'unused', label: 'इस्तेमाल नहीं किया गया 🧥' },
      ];

  // Initialize checks if not set
  React.useEffect(() => {
    const initialChecks: Record<string, boolean> = {};
    displayConditions.forEach((c: any) => {
      initialChecks[c.id] = false;
    });
    setChecks(initialChecks);
  }, [items]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.titleRow}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
              <Text style={styles.title}>वापसी सत्यापन (Return Verification)</Text>
            </View>
            <Text style={styles.subtitle}>कृपया आइटम की जांच करें और फोटो लें</Text>
          </View>
          {onFail && (
            <TouchableOpacity style={styles.failBtn} onPress={onFail}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.danger} />
              <Text style={styles.failBtnText}>ग़लत आइटम (Wrong Item)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Original Product Info for Verification */}
      {items && items.length > 0 && (
        <View style={styles.productInfoBox}>
          <Text style={styles.sectionTitle}>ओरिजिनल आइटम (Original Item)</Text>
          {items.map((item, idx) => (
            <View key={idx} style={styles.productRow}>
              <Image 
                source={{ uri: item.image || item.product?.images?.[0]?.url }} 
                style={styles.productThumb} 
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle} numberOfLines={2}>{item.title || item.product?.title}</Text>
                {item.product?.returnPolicy && (
                  <View style={styles.policyBadge}>
                    <Ionicons name="information-circle" size={12} color={Colors.primary} />
                    <Text style={styles.policyText}>
                      {item.product.returnPolicy.isReturnable ? 'Returnable' : 'Non-Returnable'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Checklist */}
      <View style={styles.checklist}>
        {displayConditions.map((c: any) => (
          <CheckItem 
            key={c.id}
            label={c.label} 
            checked={!!checks[c.id]} 
            onToggle={() => toggleCheck(c.id)} 
          />
        ))}
      </View>

      {/* Image Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>आइटम की फोटो (Product Photos)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {localUris.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.image} />
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeImage(index)}>
                <Ionicons name="close-circle" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 4 && (
            <TouchableOpacity 
              style={[styles.addBtn, isUploading && styles.disabledBtn]} 
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <>
                  <Ionicons name="camera" size={30} color={Colors.primary} />
                  <Text style={styles.addBtnText}>Add Photo</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>अतिरिक्त नोट्स (Optional Notes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Anything else about the item..."
          value={notes}
          onChangeText={handleNotesChange}
          multiline
        />
      </View>

      {/* Result Indicator */}
      {!isVerified && (
        <View style={styles.warningBox}>
          <Ionicons name="alert-circle" size={16} color="#B45309" />
          <Text style={styles.warningText}>
            Please complete all checks and add at least 1 photo to continue.
          </Text>
        </View>
      )}
    </View>
  );
};

const CheckItem = ({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) => (
  <TouchableOpacity style={styles.checkItem} onPress={onToggle} activeOpacity={0.7}>
    <View style={[styles.checkbox, checked && styles.checkboxActive]}>
      {checked && <Ionicons name="checkmark" size={16} color={Colors.white} />}
    </View>
    <Text style={[styles.checkLabel, checked && styles.checkLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    ...Shadow.md,
  },
  header: {
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  failBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: Colors.dangerLight,
    borderRadius: 8,
  },
  failBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.danger,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  productInfoBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  policyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  policyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  checklist: {
    gap: 10,
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  checkLabelActive: {
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  imageScroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    width: 90,
    height: 90,
    marginRight: 10,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
  addBtn: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + '40',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '05',
  },
  addBtnText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    height: 60,
    fontSize: 14,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  warningBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 11,
    color: '#B45309',
    flex: 1,
    lineHeight: 15,
  },
});
