import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Calculator, 
  MapPin, 
  FileText, 
  Settings, 
  Clock,
  Package,
  DollarSign,
  Truck,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
    setActiveSection(sectionId);
  };

  const sections: GuideSection[] = [
    {
      id: 'overview',
      title: 'Getting Started',
      icon: <BookOpen className="w-5 h-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Welcome to Nigerian Logistics</h4>
            </div>
            <p className="text-green-700">
              This pricing calculator helps you create accurate delivery quotes for logistics services across Lagos and Nigeria.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Key Features:</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Calculator className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm">Real-time price calculations with traffic and fuel adjustments</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm">Multi-stop route planning for complex deliveries</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm">Save and manage quotes with full CRUD operations</span>
              </li>
              <li className="flex items-start gap-2">
                <Settings className="w-4 h-4 text-green-600 mt-0.5" />
                <span className="text-sm">Admin controls for pricing parameters</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">Quick Start</h4>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>Select pickup and dropoff locations</li>
              <li>Choose load size and pickup time</li>
              <li>Review the calculated price</li>
              <li>Save your quote for future reference</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'calculator',
      title: 'Price Calculator',
      icon: <Calculator className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">How Pricing Works</h4>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-gray-700 mb-2">
                <strong>Formula:</strong> (Distance × Base Rate × Traffic Multiplier × Load Factor) × Fuel Surcharge
              </p>
              <p className="text-xs text-gray-600">
                Example: (25km × ₦300 × 1.5 × 1.25) × 1.25 = ₦17,578
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Pricing Factors</h4>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Distance</span>
                </div>
                <p className="text-sm text-gray-600">
                  Calculated between Lagos LGAs using optimized routing. System accounts for actual road distances, not straight-line measurements.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-medium">Traffic Multiplier</span>
                </div>
                <p className="text-sm text-gray-600">
                  Rush hours (6-9 AM, 5-8 PM) apply higher multipliers. Peak traffic can increase effective distance by up to 2x.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Load Size</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Half Load: ×1.15 (small packages, documents)</li>
                  <li>• Semi-Full: ×1.25 (medium cargo, partial truck)</li>
                  <li>• Full Load: ×1.40 (complete truck capacity)</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  <span className="font-medium">Fuel Surcharge</span>
                </div>
                <p className="text-sm text-gray-600">
                  Applied to final calculation to account for current fuel prices. Typically 15-40% above base rate.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-800">Rush Hour Alert</h4>
            </div>
            <p className="text-amber-700 text-sm">
              The system automatically detects rush hour times and applies appropriate traffic multipliers. 
              Consider scheduling deliveries outside peak hours for better rates.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'route-builder',
      title: 'Route Builder',
      icon: <MapPin className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Creating Routes</h4>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h5 className="font-medium text-gray-800">Step 1: Select Locations</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Choose pickup and dropoff locations from Lagos LGAs. Each location includes the LGA zone (mainland, island, outskirt) for accurate distance calculation.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h5 className="font-medium text-gray-800">Step 2: Add Specific Addresses</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Enter detailed addresses for precise location identification. This helps drivers and improves delivery accuracy.
                </p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h5 className="font-medium text-gray-800">Step 3: Configure Load & Time</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Select appropriate load size and pickup time. The system will automatically apply traffic multipliers based on your chosen time.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Multi-Stop Routes</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-3">
                Add multiple pickup and dropoff points for complex delivery routes:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
                <li>Click "Add Stop" to include additional locations</li>
                <li>Select stop type (pickup or dropoff) for each location</li>
                <li>System calculates cumulative distance for entire route</li>
                <li>Remove unnecessary stops using the X button</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Location Coverage</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800">Mainland</h5>
                <p className="text-xs text-green-600 mt-1">12 LGAs</p>
                <p className="text-xs text-green-600">Standard rates</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-800">Island</h5>
                <p className="text-xs text-blue-600 mt-1">3 LGAs</p>
                <p className="text-xs text-blue-600">Premium zones</p>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <h5 className="font-medium text-amber-800">Outskirt</h5>
                <p className="text-xs text-amber-600 mt-1">4 LGAs</p>
                <p className="text-xs text-amber-600">Extended range</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'quotes',
      title: 'Quote Management',
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Managing Quotes</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Creating Quotes</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Configure route in the Calculator tab</li>
                  <li>• Review price breakdown and details</li>
                  <li>• Click "Save Quote" to store in local database</li>
                  <li>• Quotes are automatically timestamped</li>
                </ul>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Quote Status</h5>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Draft</span>
                    <span className="text-sm text-gray-600">Initial quote, not yet confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Confirmed</span>
                    <span className="text-sm text-gray-600">Customer approved, ready for delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Completed</span>
                    <span className="text-sm text-gray-600">Delivery finished successfully</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Search & Filter</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-medium">Search:</span>
                  <span>Find quotes by location names or addresses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Filter:</span>
                  <span>Sort by status (All, Draft, Confirmed, Completed)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium">Export:</span>
                  <span>Download all quotes as CSV for external analysis</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Quote Actions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-1">Edit Quote</h5>
                <p className="text-xs text-gray-600">
                  Modify route, load size, or timing. Updates price automatically.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-3">
                <h5 className="font-medium text-gray-800 mb-1">Delete Quote</h5>
                <p className="text-xs text-gray-600">
                  Permanently remove quotes. Requires confirmation to prevent accidents.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'admin',
      title: 'Admin Settings',
      icon: <Settings className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-800">Admin Access Required</h4>
            </div>
            <p className="text-red-700 text-sm">
              These settings affect pricing calculations for all users. Only authorized personnel should modify these parameters.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Pricing Parameters</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Base Rate (₦/km)</h5>
                <p className="text-sm text-gray-600 mb-2">
                  Fundamental pricing per kilometer before any multipliers. Default: ₦300/km
                </p>
                <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800">
                  <strong>Impact:</strong> Directly affects all quote calculations
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Fuel Surcharge Multiplier</h5>
                <p className="text-sm text-gray-600 mb-2">
                  Applied to final price to account for fuel costs. Range: 1.15 - 1.40 (15-40% surcharge)
                </p>
                <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800">
                  <strong>Update Frequency:</strong> Should reflect current fuel prices
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Load Size Factors</h5>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">Half Load</div>
                    <div className="text-gray-600">×1.15</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">Semi-Full</div>
                    <div className="text-gray-600">×1.25</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">Full Load</div>
                    <div className="text-gray-600">×1.40</div>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">Traffic Multipliers</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Hourly multipliers to account for Lagos traffic patterns:
                </p>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium">6-9 AM</div>
                    <div className="text-red-600">1.3-2.0×</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium">10-16</div>
                    <div className="text-green-600">1.0×</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="font-medium">17-20</div>
                    <div className="text-red-600">1.5-2.0×</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="font-medium">21-5</div>
                    <div className="text-green-600">1.0×</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Best Practices</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Review and update fuel surcharge weekly based on market prices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Monitor traffic patterns and adjust multipliers seasonally</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Test parameter changes with sample calculations before applying</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Keep backup of previous settings before major changes</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <AlertCircle className="w-5 h-5" />,
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Common Issues</h4>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-red-600 mb-2">Price Not Calculating</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Cause:</strong> Missing pickup or dropoff location</p>
                  <p><strong>Solution:</strong> Ensure both locations are selected from the LGA dropdown</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-red-600 mb-2">Quotes Not Saving</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Cause:</strong> Browser storage restrictions or private browsing</p>
                  <p><strong>Solution:</strong> Enable local storage and disable private browsing mode</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-red-600 mb-2">High Price Calculations</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Cause:</strong> Rush hour traffic multipliers or fuel surcharge</p>
                  <p><strong>Solution:</strong> Check pickup time and current fuel surcharge settings</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-red-600 mb-2">Cannot Add More Stops</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Cause:</strong> System performance optimization</p>
                  <p><strong>Solution:</strong> Complex routes with 10+ stops should be split into multiple quotes</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Data Recovery</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">Lost Quotes</h5>
              <p className="text-blue-700 text-sm mb-3">
                Quotes are stored locally in your browser. If data is lost:
              </p>
              <ol className="list-decimal list-inside text-blue-700 text-sm space-y-1">
                <li>Check if you're using the same browser and device</li>
                <li>Ensure browser data wasn't cleared</li>
                <li>Look for exported CSV backups</li>
                <li>Recreate important quotes from customer records</li>
              </ol>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Performance Tips</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Regularly export quotes to prevent data loss</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Clear old quotes periodically to maintain performance</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Use specific addresses for better route accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Update admin settings during off-peak hours</span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">Need More Help?</h4>
            </div>
            <p className="text-green-700 text-sm">
              Contact your system administrator or IT support team for technical issues not covered in this guide.
            </p>
          </div>
        </div>
      )
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">User Guide</h2>
            </div>
            <p className="text-sm text-gray-600">Complete manual for Nigerian Logistics Calculator</p>
          </div>

          <nav className="p-4">
            {sections.map((section) => (
              <div key={section.id} className="mb-2">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {section.icon}
                    <span className="font-medium">{section.title}</span>
                  </div>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {sections.find(s => s.id === activeSection)?.icon}
              <h3 className="text-xl font-semibold text-gray-800">
                {sections.find(s => s.id === activeSection)?.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {sections.find(s => s.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};