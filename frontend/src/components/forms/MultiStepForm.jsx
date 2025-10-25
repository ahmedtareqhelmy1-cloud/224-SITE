import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { uploadImage } from '../../features/products/productsSlice';

const stepsInfo = [
  { id: 'product-type', title: 'Product Type' },
  { id: 'customization', title: 'Customization' },
  { id: 'measurements', title: 'Measurements' },
  { id: 'confirmation', title: 'Confirmation' }
];

const StepIndicator = ({ currentStep }) => (
  <div className="w-full py-4">
    <div className="flex items-center justify-between">
      {stepsInfo.map((step, idx) => (
        <div key={step.id} className="flex flex-col items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center 
              ${idx <= currentStep 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-200 text-gray-500'}`}
          >
            {idx + 1}
          </div>
          <span className="mt-2 text-sm">{step.title}</span>
        </div>
      ))}
    </div>
    <div className="mt-4 h-1 w-full bg-gray-200">
      <div 
        className="h-full bg-indigo-600 transition-all duration-500"
        style={{ width: `${(currentStep / (stepsInfo.length - 1)) * 100}%` }}
      />
    </div>
  </div>
);

const ProductTypeStep = ({ formData, setFormData }) => {
  const productTypes = [
    { type: 'Shirt', icon: '👕' },
    { type: 'Pants', icon: '👖' },
    { type: 'Dress', icon: '👗' },
    { type: 'Suit', icon: '🤵' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Select Product Type</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productTypes.map(({ type, icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, productType: type })}
            className={`p-6 border rounded-lg transition-all duration-200 transform hover:scale-105 ${
              formData.productType === type 
                ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl mb-2 block">{icon}</span>
            <span className="block text-lg font-medium text-gray-900">{type}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const CustomizationStep = ({ formData, setFormData }) => {
  const [selectedColor, setSelectedColor] = useState(formData.color || null);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const colorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'Navy', value: '#000080' },
    { name: 'Gray', value: '#808080' },
    { name: 'Brown', value: '#8B4513' },
    { name: 'Beige', value: '#F5F5DC' }
  ];

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setFormData({ ...formData, color });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageLoading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          referenceImage: { preview: reader.result, file }
        });
        setImageLoading(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read the image file');
        setImageLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Failed to process the image');
      setImageLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Customize Your {formData.productType}</h3>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <div className="flex space-x-3">
          {colorOptions.map(({ name, value }) => (
            <div key={value} className="flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={() => handleColorSelect(value)}
                className={`w-8 h-8 rounded-full focus:outline-none ${
                  selectedColor === value ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                }`}
                style={{ backgroundColor: value }}
                title={name}
              />
              <span className="text-xs">{name}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">Reference Image (Optional)</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center w-full">
              {imageLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : formData.referenceImage?.preview ? (
                <div className="relative inline-block">
                  <img
                    src={formData.referenceImage.preview}
                    alt="Reference"
                    className="mx-auto h-32 w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, referenceImage: null })}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div>
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center mt-2 gap-2">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MeasurementsStep and ConfirmationStep are similar to your previous version
// I cleaned them and kept proper defaulting and mapping for safety

const MeasurementsStep = ({ formData, setFormData }) => {
  const measurementFields = {
    Shirt: ['chest', 'waist', 'shoulders', 'sleeves', 'length'],
    Pants: ['waist', 'hip', 'inseam', 'outseam', 'thigh'],
    Dress: ['bust', 'waist', 'hip', 'length', 'shoulders'],
    Suit: ['chest', 'waist', 'shoulders', 'sleeves', 'inseam']
  };

  const fields = measurementFields[formData.productType] || [];

  const handleMeasurementChange = (field, value) => {
    setFormData({
      ...formData,
      measurements: { ...formData.measurements, [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Enter Your Measurements</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 capitalize">{field} (cm)</label>
            <input
              type="number"
              value={formData.measurements?.[field] || ''}
              onChange={(e) => handleMeasurementChange(field, e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfirmationStep = ({ formData }) => {
  const priceEstimate = calculatePrice(formData);
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Review Your Order</h3>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Order Summary</h3>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Product Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.productType}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: formData.color }} />
                  <span>Selected Color</span>
                </div>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Measurements</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                  {Object.entries(formData.measurements || {}).map(([key, value]) => (
                    <li key={key} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                      <div className="w-0 flex-1 flex items-center">
                        <span className="ml-2 flex-1 w-0 truncate capitalize">{key}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">{value} cm</div>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Estimated Price</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">EGP {priceEstimate.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

function calculatePrice(formData) {
  const basePrice = {
    Shirt: 500,
    Pants: 600,
    Dress: 800,
    Suit: 1500
  }[formData.productType] || 0;

  const measurementsCount = Object.keys(formData.measurements || {}).length;
  const measurementMultiplier = 1 + (measurementsCount * 0.05);

  return basePrice * measurementMultiplier;
}

export default function MultiStepForm({ onSubmit, onCancel }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    productType: '',
    color: '',
    measurements: {},
    referenceImage: null
  });

  const steps = [
    { component: ProductTypeStep, validate: () => !!formData.productType },
    { component: CustomizationStep, validate: () => !!formData.color },
    { 
      component: MeasurementsStep, 
      validate: () => {
        const measurements = formData.measurements || {};
        const requiredFields = {
          Shirt: ['chest','waist','shoulders','sleeves','length'],
          Pants: ['waist','hip','inseam','outseam','thigh'],
          Dress: ['bust','waist','hip','length','shoulders'],
          Suit: ['chest','waist','shoulders','sleeves','inseam']
        }[formData.productType] || [];
        return requiredFields.every(field => !!measurements[field]);
      }
    },
    { component: ConfirmationStep, validate: () => true }
  ];

  const StepComponent = steps[currentStep].component;
  const canProceed = steps[currentStep].validate();

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else onCancel();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator currentStep={currentStep} />

      <div className="mt-8">
        <AnimatePresence>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <StepComponent formData={formData} setFormData={setFormData} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm 
            font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-indigo-500"
        >
          {currentStep === 0 ? 'Cancel' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className={`inline-flex justify-center py-2 px-4 border border-transparent 
            shadow-sm text-sm font-medium rounded-md text-white 
            ${canProceed ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
        >
          {currentStep === steps.length - 1 ? 'Submit Order' : 'Next'}
        </button>
      </div>
    </div>
  );
}
