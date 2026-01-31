// components/ui/SheetLayout.tsx
import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { View, Text, TouchableOpacity, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

interface SheetLayoutProps {
  title: string;
  children: ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

const SheetLayout = forwardRef<any, SheetLayoutProps>(
  (
    {
      title,
      children,
      snapPoints: customSnapPoints,

      onClose,
    },
    ref
  ) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(
      () => customSnapPoints || ["50%", "85%"], // default to almost full screen
      [customSnapPoints]
    );

    // Handle keyboard events
    useEffect(() => {
      const keyboardWillShow = Keyboard.addListener("keyboardDidShow", () => {
        bottomSheetRef.current?.snapToIndex(1);
      });

      const keyboardWillHide = Keyboard.addListener("keyboardDidHide", () => {
        bottomSheetRef.current?.snapToIndex(0);
      });

      return () => {
        keyboardWillShow.remove();
        keyboardWillHide.remove();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(0),
      close: () => {
        bottomSheetRef.current?.close();
        onClose?.();
      },
    }));

    const handleClose = useCallback(() => {
      bottomSheetRef.current?.close();
      onClose?.();
    }, [onClose]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        enablePanDownToClose={false}
        enableOverDrag={false}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: "#121212" }}
        handleIndicatorStyle={{
          backgroundColor: "#10b981",
          width: 40,
          height: 5,
        }}
        handleStyle={{
          backgroundColor: "#121212",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
        onClose={onClose}
      >
        <View className="flex-1 bg-background">
          {/* Single Header */}
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-surface">
            <Text className="text-text-primary text-xl font-bold">{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-circle" size={32} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <BottomSheetScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    );
  }
);

SheetLayout.displayName = "SheetLayout";

export default SheetLayout;
