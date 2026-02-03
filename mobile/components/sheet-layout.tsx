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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface SheetLayoutProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

const SheetLayout = forwardRef<any, SheetLayoutProps>(
  ({ title, children, footer, snapPoints: customSnapPoints, onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(
      () => customSnapPoints || ["50%", "85%"],
      [customSnapPoints]
    );

    const footerMargin = useSharedValue(80);

    const footerStyle = useAnimatedStyle(() => {
      return {
        marginBottom: footerMargin.value,
      };
    });

    useEffect(() => {
      const expandedIndex = snapPoints.length > 1 ? 1 : 0;

      const showSub = Keyboard.addListener("keyboardDidShow", () => {
        bottomSheetRef.current?.snapToIndex(expandedIndex);
      });

      const hideSub = Keyboard.addListener("keyboardDidHide", () => {
        bottomSheetRef.current?.snapToIndex(0);
      });

      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }, [snapPoints]);

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

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === 0) {
          footerMargin.value = withTiming(250, { duration: 300 });
        } else if (index === 1) {
          footerMargin.value = withTiming(80, { duration: 300 });
        }
      },
      [footerMargin]
    );

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
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
          <View className="flex-row items-center justify-between px-6 py-5 border-b border-surface">
            <Text className="text-text-primary text-xl font-bold">{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close-circle" size={32} color="#666" />
            </TouchableOpacity>
          </View>

          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: 20,
              paddingBottom: footer ? 140 : 20,
            }}
          >
            {children}
          </BottomSheetScrollView>

          {footer && (
            <Animated.View
              style={footerStyle}
              className="border-t border-surface bg-background px-6 py-4"
            >
              {footer}
            </Animated.View>
          )}
        </View>
      </BottomSheet>
    );
  }
);

SheetLayout.displayName = "SheetLayout";
export default SheetLayout;
