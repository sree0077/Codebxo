import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Input, Button, Dropdown } from '../common';
import { BUSINESS_TYPES, CUSTOMER_POTENTIAL, USING_SYSTEM_OPTIONS } from '../../utils/constants';
import { validateClientForm } from '../../utils/validators';
import useLocation from '../../hooks/useLocation';

const ClientForm = ({ initialData = {}, onSubmit, isLoading = false, submitLabel = 'Save Client' }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    phoneNumber: '',
    companyName: '',
    businessType: '',
    usingSystem: '',
    customerPotential: '',
    address: '',
    location: null,
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const { location, address, isLoading: locationLoading, getCurrentLocation } = useLocation();

  // Update form when location is captured
  useEffect(() => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        location,
        address: address || prev.address,
      }));
    }
  }, [location, address]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleCaptureLocation = async () => {
    const loc = await getCurrentLocation();
    if (!loc) {
      Alert.alert('Location Error', 'Unable to capture location. Please check your permissions.');
    }
  };

  const handleSubmit = () => {
    const validation = validateClientForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    onSubmit(formData);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        <Input
          label="Client Name *"
          value={formData.clientName}
          onChangeText={(value) => handleChange('clientName', value)}
          placeholder="Enter client name"
          error={errors.clientName}
        />

        <Input
          label="Phone Number *"
          value={formData.phoneNumber}
          onChangeText={(value) => handleChange('phoneNumber', value)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.phoneNumber}
        />

        <Input
          label="Company Name"
          value={formData.companyName}
          onChangeText={(value) => handleChange('companyName', value)}
          placeholder="Enter company name"
        />

        <Dropdown
          label="Type of Business *"
          value={formData.businessType}
          options={BUSINESS_TYPES}
          onSelect={(value) => handleChange('businessType', value)}
          error={errors.businessType}
        />

        <Dropdown
          label="Currently Using System *"
          value={formData.usingSystem}
          options={USING_SYSTEM_OPTIONS}
          onSelect={(value) => handleChange('usingSystem', value)}
          error={errors.usingSystem}
        />

        <Dropdown
          label="Customer Potential"
          value={formData.customerPotential}
          options={CUSTOMER_POTENTIAL}
          onSelect={(value) => handleChange('customerPotential', value)}
        />

        {/* Location Section */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2 text-base">GPS Location</Text>
          <Button
            title={locationLoading ? 'Capturing...' : '📍 Capture Current Location'}
            onPress={handleCaptureLocation}
            variant="outline"
            loading={locationLoading}
          />
          {formData.location && (
            <View className="mt-2 p-3 bg-green-50 rounded-xl">
              <Text className="text-green-700 text-sm">
                📍 Lat: {formData.location.latitude.toFixed(6)}, 
                Long: {formData.location.longitude.toFixed(6)}
              </Text>
            </View>
          )}
        </View>

        <Input
          label="Address"
          value={formData.address}
          onChangeText={(value) => handleChange('address', value)}
          placeholder="Enter address or capture from GPS"
          multiline
          numberOfLines={3}
        />

        <View className="mt-4 mb-8">
          <Button title={submitLabel} onPress={handleSubmit} loading={isLoading} />
        </View>
      </View>
    </ScrollView>
  );
};

export default ClientForm;

