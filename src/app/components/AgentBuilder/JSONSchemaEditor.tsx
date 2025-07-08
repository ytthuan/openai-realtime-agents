'use client';

import React, { useState } from 'react';
import { JSONSchema, JSONSchemaProperty } from '../../types/agentBuilder';

interface JSONSchemaEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  className?: string;
}

interface PropertyEditorProps {
  property: JSONSchemaProperty;
  propertyName: string;
  onChange: (property: JSONSchemaProperty) => void;
  onDelete: () => void;
}

function PropertyEditor({ property, propertyName, onChange, onDelete }: PropertyEditorProps) {
  const handleTypeChange = (type: JSONSchemaProperty['type']) => {
    const updatedProperty: JSONSchemaProperty = { ...property, type };
    
    // Reset type-specific fields when type changes
    if (type !== 'object') {
      delete updatedProperty.properties;
      delete updatedProperty.additionalProperties;
    }
    if (type !== 'array') {
      delete updatedProperty.items;
      delete updatedProperty.minItems;
      delete updatedProperty.maxItems;
    }
    if (!['string', 'number'].includes(type)) {
      delete updatedProperty.enum;
      delete updatedProperty.pattern;
    }
    
    onChange(updatedProperty);
  };

  const addProperty = () => {
    if (property.type === 'object') {
      const newProperties = {
        ...property.properties,
        [`newProperty${Date.now()}`]: { type: 'string' as const }
      };
      onChange({ ...property, properties: newProperties });
    }
  };

  const updateProperty = (propName: string, updatedProp: JSONSchemaProperty) => {
    if (property.properties) {
      const newProperties = { ...property.properties };
      newProperties[propName] = updatedProp;
      onChange({ ...property, properties: newProperties });
    }
  };

  const deleteProperty = (propName: string) => {
    if (property.properties) {
      const newProperties = { ...property.properties };
      delete newProperties[propName];
      onChange({ ...property, properties: newProperties });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{propertyName}</h4>
        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={property.type}
            onChange={(e) => handleTypeChange(e.target.value as JSONSchemaProperty['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="array">Array</option>
            <option value="object">Object</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={property.description || ''}
            onChange={(e) => onChange({ ...property, description: e.target.value })}
            placeholder="Property description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {property.type === 'string' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pattern (RegEx)</label>
            <input
              type="text"
              value={property.pattern || ''}
              onChange={(e) => onChange({ ...property, pattern: e.target.value })}
              placeholder="e.g., ^[0-9]+$"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enum Values (comma-separated)</label>
            <input
              type="text"
              value={property.enum ? property.enum.join(', ') : ''}
              onChange={(e) => {
                const enumValues = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                onChange({ ...property, enum: enumValues.length > 0 ? enumValues : undefined });
              }}
              placeholder="e.g., option1, option2, option3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {property.type === 'array' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Items</label>
              <input
                type="number"
                value={property.minItems || ''}
                onChange={(e) => onChange({ ...property, minItems: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Items</label>
              <input
                type="number"
                value={property.maxItems || ''}
                onChange={(e) => onChange({ ...property, maxItems: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {property.items && (
            <div className="ml-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Array Items</h5>
              <PropertyEditor
                property={property.items}
                propertyName="items"
                onChange={(items) => onChange({ ...property, items })}
                onDelete={() => onChange({ ...property, items: undefined })}
              />
            </div>
          )}
          {!property.items && (
            <button
              onClick={() => onChange({ ...property, items: { type: 'string' } })}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Define Array Items
            </button>
          )}
        </div>
      )}

      {property.type === 'object' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Properties</h5>
            <button
              onClick={addProperty}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Add Property
            </button>
          </div>
          
          {property.properties && Object.entries(property.properties).map(([propName, prop]) => (
            <div key={propName} className="ml-4">
              <PropertyEditor
                property={prop}
                propertyName={propName}
                onChange={(updatedProp) => updateProperty(propName, updatedProp)}
                onDelete={() => deleteProperty(propName)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function JSONSchemaEditor({ schema, onChange, className = '' }: JSONSchemaEditorProps) {
  const [showRawEditor, setShowRawEditor] = useState(false);
  const [rawSchema, setRawSchema] = useState(JSON.stringify(schema, null, 2));

  const addProperty = () => {
    const newProperties = {
      ...schema.properties,
      [`newProperty${Date.now()}`]: { type: 'string' as const }
    };
    onChange({ ...schema, properties: newProperties });
  };

  const updateProperty = (propName: string, property: JSONSchemaProperty) => {
    if (schema.properties) {
      const newProperties = { ...schema.properties };
      newProperties[propName] = property;
      onChange({ ...schema, properties: newProperties });
    }
  };

  const deleteProperty = (propName: string) => {
    if (schema.properties) {
      const newProperties = { ...schema.properties };
      delete newProperties[propName];
      const newRequired = schema.required?.filter(req => req !== propName);
      onChange({ ...schema, properties: newProperties, required: newRequired });
    }
  };

  const toggleRequired = (propName: string) => {
    const currentRequired = schema.required || [];
    const newRequired = currentRequired.includes(propName)
      ? currentRequired.filter(req => req !== propName)
      : [...currentRequired, propName];
    onChange({ ...schema, required: newRequired });
  };

  const handleRawSchemaChange = () => {
    try {
      const parsed = JSON.parse(rawSchema);
      onChange(parsed);
      setShowRawEditor(false);
    } catch (error) {
      alert('Invalid JSON schema');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Schema Definition</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRawEditor(!showRawEditor)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            {showRawEditor ? 'Visual Editor' : 'Raw JSON'}
          </button>
          {!showRawEditor && (
            <button
              onClick={addProperty}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Add Property
            </button>
          )}
        </div>
      </div>

      {showRawEditor ? (
        <div className="space-y-3">
          <textarea
            value={rawSchema}
            onChange={(e) => setRawSchema(e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleRawSchemaChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Changes
            </button>
            <button
              onClick={() => {
                setRawSchema(JSON.stringify(schema, null, 2));
                setShowRawEditor(false);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p><strong>Type:</strong> {schema.type}</p>
            <p><strong>Description:</strong> {schema.description || 'No description'}</p>
          </div>

          {schema.properties && Object.entries(schema.properties).map(([propName, property]) => (
            <div key={propName} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">{propName}</h4>
                <div className="flex items-center space-x-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={schema.required?.includes(propName) || false}
                      onChange={() => toggleRequired(propName)}
                      className="mr-1"
                    />
                    Required
                  </label>
                </div>
              </div>
              <PropertyEditor
                property={property}
                propertyName={propName}
                onChange={(updatedProperty) => updateProperty(propName, updatedProperty)}
                onDelete={() => deleteProperty(propName)}
              />
            </div>
          ))}

          {(!schema.properties || Object.keys(schema.properties).length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No properties defined. Click &quot;Add Property&quot; to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 