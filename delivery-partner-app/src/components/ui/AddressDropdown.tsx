import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize, Shadow } from '../../utils/theme';

interface AddressDropdownProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (item: string) => void;
    data: string[];
    title: string;
    placeholder?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AddressDropdown: React.FC<AddressDropdownProps> = ({
    visible,
    onClose,
    onSelect,
    data,
    title,
    placeholder = 'Search...',
}) => {
    const [search, setSearch] = useState('');

    const filteredData = data.filter(item =>
        item.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (item: string) => {
        onSelect(item);
        setSearch('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchWrapper}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder={placeholder}
                            value={search}
                            onChangeText={setSearch}
                            autoFocus={false}
                        />
                    </View>

                    <FlatList
                        data={filteredData}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.item}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.itemText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No results found</Text>
                            </View>
                        }
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        height: SCREEN_HEIGHT * 0.7,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        fontSize: 16,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    searchWrapper: {
        padding: Spacing.md,
    },
    searchInput: {
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        padding: 12,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
    },
    item: {
        paddingVertical: 16,
    },
    itemText: {
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        fontWeight: '500',
    },
    separator: {
        height: 1,
        backgroundColor: Colors.border,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
    },
});
