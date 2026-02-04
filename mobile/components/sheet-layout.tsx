import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetFooter,
  BottomSheetFooterProps,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
    const footerTranslateY = useSharedValue(100);
    const insets = useSafeAreaInsets();

    const bottomInset = useMemo(() => {
      const safeAreaBottom = insets.bottom;

      if (safeAreaBottom > 0) {
        return safeAreaBottom;
      } else {
        {
          return 20;
        }
      }
    }, [insets.bottom]);

    const snapPoints = useMemo(
      () => customSnapPoints || ["50%", "85%"],
      [customSnapPoints]
    );

    // Handle keyboard events
    useEffect(() => {
      const expandedIndex = snapPoints.length > 1 ? 1 : 0;
      const keyboardDidShow = Keyboard.addListener("keyboardDidShow", () => {
        bottomSheetRef.current?.snapToIndex(expandedIndex);
      });

      const keyboardDidHide = Keyboard.addListener("keyboardDidHide", () => {
        bottomSheetRef.current?.snapToIndex(0);
      });

      return () => {
        keyboardDidShow.remove();
        keyboardDidHide.remove();
      };
    }, [snapPoints]);

    useImperativeHandle(ref, () => ({
      open: () => {
        bottomSheetRef.current?.snapToIndex(0);
        footerTranslateY.value = 100;
        setTimeout(() => {
          footerTranslateY.value = withSpring(0, {
            damping: 40,
            stiffness: 200,
            mass: 0.5,
          });
        }, 100);
      },
      close: () => {
        footerTranslateY.value = withSpring(100, {
          damping: 40,
          stiffness: 200,
          mass: 0.5,
        });
        setTimeout(() => {
          bottomSheetRef.current?.close();
          onClose?.();
        }, 200);
      },
    }));

    const handleClose = useCallback(() => {
      footerTranslateY.value = withSpring(100, {
        damping: 15,
        stiffness: 150,
        mass: 0.5,
      });
      setTimeout(() => {
        bottomSheetRef.current?.close();
        onClose?.();
      }, 200);
    }, [onClose, footerTranslateY]);

    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1) {
          footerTranslateY.value = 100;
        }
      },
      [footerTranslateY]
    );

    const animatedFooterStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateY: footerTranslateY.value,
        },
      ],
    }));

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) =>
        footer ? (
          <BottomSheetFooter {...props} bottomInset={0}>
            <Animated.View style={animatedFooterStyle}>
              <View className="bg-background border-t border-surface px-6 py-4">
                {footer}
              </View>
            </Animated.View>
          </BottomSheetFooter>
        ) : null,
      [footer, animatedFooterStyle]
    );

    return (
      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          bottomInset={bottomInset}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          enableOverDrag={false}
          animateOnMount={true}
          keyboardBehavior="extend"
          keyboardBlurBehavior="restore"
          android_keyboardInputMode="adjustResize"
          backgroundStyle={{ backgroundColor: "#121212" }}
          handleIndicatorStyle={{
            backgroundColor: "#10b981",
            width: 90,
            height: 5,
          }}
          handleStyle={{
            backgroundColor: "#121212",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          footerComponent={renderFooter}
          onChange={handleSheetChange}
          onClose={onClose}
        >
          <View className="flex-1 bg-background">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-surface">
              <Text className="text-text-primary text-xl font-bold">
                {title}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Ionicons name="close-circle" size={32} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Scrollable content */}
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 270,
              }}
            >
              {children}
            </BottomSheetScrollView>
          </View>
        </BottomSheet>
      </Portal>
    );
  }
);

SheetLayout.displayName = "SheetLayout";

export default SheetLayout;
