import SheetLayout from "@/components/sheet-layout";
import {
  AddressFormData,
  addressSchema,
} from "@/lib/validation/address.schema";
import { Address } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AddressFormProps {
  address?: Address;
  onSubmit: (data: AddressFormData) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
}

export interface AddressFormRef {
  open: () => void;
  close: () => void;
}

const AddressForm = forwardRef<AddressFormRef, AddressFormProps>(
  ({ address, onSubmit, isSubmitting, onClose }, ref) => {
    const sheetRef = useRef<any>(null);
    const isEditMode = !!address;

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
      reset,
    } = useForm<AddressFormData>({
      resolver: zodResolver(addressSchema),
      defaultValues: {
        fullName: "",
        label: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        phoneNumber: "",
        isDefault: false,
      },
    });

    useEffect(() => {
      if (address) {
        reset({
          fullName: address.fullName,
          label: address.label,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phoneNumber: address.phoneNumber,
          isDefault: address.isDefault ?? false,
        });
      } else {
        reset({
          fullName: "",
          label: "",
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
          phoneNumber: "",
          isDefault: false,
        });
      }
    }, [address, reset]);

    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.open(),
      close: () => sheetRef.current?.close(),
    }));

    const isDefault = watch("isDefault");

    const footer = (
      <TouchableOpacity
        className={`rounded-xl py-4 items-center ${
          isSubmitting ? "bg-primary/50" : "bg-primary"
        }`}
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        {isSubmitting ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#000" />
            <Text className="text-background font-bold text-base ml-2">
              {isEditMode ? "Updating..." : "Adding..."}
            </Text>
          </View>
        ) : (
          <Text className="text-background font-bold text-base">
            {isEditMode ? "Update Address" : "Add Address"}
          </Text>
        )}
      </TouchableOpacity>
    );

    return (
      <SheetLayout
        ref={sheetRef}
        title={isEditMode ? "Edit Address" : "Add New Address"}
        snapPoints={["65%", "95%"]}
        onClose={onClose}
        footer={footer}
      >
        <View className="flex-1">
          {/* Label */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">Label</Text>
            <Controller
              control={control}
              name="label"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="e.g., Home, Work, Office"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.label && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.label.message}
              </Text>
            )}
          </View>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">
              Full Name
            </Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="Enter your full name"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.fullName && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </Text>
            )}
          </View>

          {/* Street Address */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">
              Street Address
            </Text>
            <Controller
              control={control}
              name="street"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="Street address, apt/suite number"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.street && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.street.message}
              </Text>
            )}
          </View>

          {/* City */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">City</Text>
            <Controller
              control={control}
              name="city"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="e.g., New York"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.city && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.city.message}
              </Text>
            )}
          </View>

          {/* State */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">State</Text>
            <Controller
              control={control}
              name="state"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="e.g., NY"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.state && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.state.message}
              </Text>
            )}
          </View>

          {/* ZIP Code */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">
              ZIP Code
            </Text>
            <Controller
              control={control}
              name="postalCode"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="e.g., 10001"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.postalCode && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.postalCode.message}
              </Text>
            )}
          </View>

          {/* Country */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">
              Country
            </Text>
            <Controller
              control={control}
              name="country"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="e.g., United States"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.country && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.country.message}
              </Text>
            )}
          </View>

          {/* Phone Number */}
          <View className="mb-4">
            <Text className="text-text-primary font-semibold mb-2">
              Phone Number
            </Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className="bg-surface text-text-primary px-4 py-3 rounded-xl"
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor="#666"
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  editable={!isSubmitting}
                />
              )}
            />
            {errors.phoneNumber && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.phoneNumber.message}
              </Text>
            )}
          </View>

          {/* Set as Default */}
          <TouchableOpacity
            className="flex-row items-center justify-between bg-surface px-4 py-4 rounded-xl mb-4"
            onPress={() => setValue("isDefault", !isDefault)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text className="text-text-primary font-semibold">
              Set as default address
            </Text>
            <View
              className={`w-12 h-7 rounded-full ${
                isDefault ? "bg-primary" : "bg-gray-600"
              } justify-center`}
            >
              <View
                className={`w-5 h-5 bg-white rounded-full ${
                  isDefault ? "ml-6" : "ml-1"
                }`}
              />
            </View>
          </TouchableOpacity>
        </View>
      </SheetLayout>
    );
  }
);

AddressForm.displayName = "AddressForm";

export default AddressForm;
