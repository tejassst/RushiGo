import { Bell, Clock, Calendar, AlertCircle, Mail, X } from "lucide-react";
import { Button } from "./ui/button";

interface NotificationInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationInfoModal({
  isOpen,
  onClose,
}: NotificationInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Email Notifications</h2>
                <p className="text-sm text-white/80">
                  Stay on top of your deadlines
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Automatic Email Reminders
                </h3>
                <p className="text-sm text-gray-600">
                  RushiGo automatically sends email reminders at strategic times
                  to help you never miss a deadline. Once you create a deadline,
                  our system takes care of the rest!
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Notification Timeline
            </h3>
            <div className="space-y-4">
              {/* 3 Days Before */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                  3d
                </div>
                <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    3 Days Before
                  </h4>
                  <p className="text-sm text-gray-600">
                    First reminder sent 72 hours before your deadline. Perfect
                    for starting your work with plenty of time.
                  </p>
                </div>
              </div>

              {/* 1 Day Before */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shadow-md">
                  1d
                </div>
                <div className="flex-1 bg-amber-50 rounded-lg p-4 border border-amber-200">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    1 Day Before
                  </h4>
                  <p className="text-sm text-gray-600">
                    Second reminder sent 24 hours before. Time to finalize and
                    review your work.
                  </p>
                </div>
              </div>

              {/* 1 Hour Before */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-md">
                  1h
                </div>
                <div className="flex-1 bg-red-50 rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    1 Hour Before
                  </h4>
                  <p className="text-sm text-gray-600">
                    Final reminder sent 1 hour before deadline. Last chance to
                    take action!
                  </p>
                </div>
              </div>

              {/* Overdue */}
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="flex-1 bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Overdue Reminders
                  </h4>
                  <p className="text-sm text-gray-600">
                    Daily reminders for overdue deadlines until you mark them as
                    complete.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Smart Features
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>
                      <strong>Timezone Aware:</strong> Notifications respect
                      your local time
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>
                      <strong>No Duplicates:</strong> Each reminder sent only
                      once per deadline
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>
                      <strong>Automatic:</strong> Set it and forget it - we
                      handle the rest
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-600 mr-2">✓</span>
                    <span>
                      <strong>Email Delivery:</strong> Check your inbox for
                      notifications
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 shadow-md"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
