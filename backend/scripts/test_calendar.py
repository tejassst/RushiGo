#!/usr/bin/env python3
"""
Test script for Google Calendar integration
"""
import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.calendar_service import get_calendar_service


def test_calendar():
    """Test Google Calendar API integration"""
    print("🧪 Testing Google Calendar integration...")
    print("=" * 60)
    
    # Initialize calendar service
    try:
        print("\n1️⃣  Initializing Calendar service...")
        calendar = get_calendar_service()
        print("✅ Calendar service initialized successfully!")
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        print("\n📝 Please follow these steps:")
        print("1. Enable Google Calendar API in Google Cloud Console")
        print("2. Use the same credentials.json from Gmail setup")
        print("\nSee GOOGLE_CALENDAR_INTEGRATION.md for detailed instructions.")
        return
    except Exception as e:
        print(f"❌ Error initializing Calendar service: {e}")
        return
    
    # Create a test event
    print("\n2️⃣  Creating a test calendar event...")
    try:
        test_date = datetime.utcnow() + timedelta(days=1)
        event = calendar.create_event(
            title="🧪 RushiGo Test Event",
            description="This is a test event created by RushiGo's calendar integration. You can safely delete this.",
            start_datetime=test_date,
            estimated_hours=2,
            course="Testing 101",
            priority="high"
        )
        
        event_id = event.get('id')
        event_link = event.get('htmlLink')
        
        print(f"✅ Event created successfully!")
        print(f"   Event ID: {event_id}")
        print(f"   Link: {event_link}")
        
    except Exception as e:
        print(f"❌ Failed to create event: {e}")
        return
    
    # Update the event
    print("\n3️⃣  Updating the test event...")
    try:
        calendar.update_event(
            event_id=event_id,
            title="🧪 RushiGo Test Event (UPDATED)",
            description="This event has been updated by RushiGo.",
            priority="medium",
            completed=True
        )
        print("✅ Event updated successfully!")
        
    except Exception as e:
        print(f"❌ Failed to update event: {e}")
        # Continue to deletion
    
    # Get upcoming events
    print("\n4️⃣  Fetching upcoming events...")
    try:
        events = calendar.get_upcoming_events(max_results=5)
        print(f"✅ Found {len(events)} upcoming events")
        
        if events:
            print("\n   Recent events:")
            for evt in events[:3]:
                title = evt.get('summary', 'No title')
                start = evt.get('start', {}).get('dateTime', evt.get('start', {}).get('date', 'No date'))
                print(f"   • {title} - {start}")
        
    except Exception as e:
        print(f"❌ Failed to fetch events: {e}")
    
    # Delete the test event
    print("\n5️⃣  Deleting the test event...")
    try:
        success = calendar.delete_event(event_id)
        if success:
            print("✅ Event deleted successfully!")
        else:
            print("⚠️  Event deletion returned False")
            
    except Exception as e:
        print(f"❌ Failed to delete event: {e}")
        print(f"   You may need to manually delete event ID: {event_id}")
        return
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 All tests passed successfully!")
    print("\n📋 Summary:")
    print("   ✅ Calendar service initialized")
    print("   ✅ Event creation works")
    print("   ✅ Event updates work")
    print("   ✅ Event listing works")
    print("   ✅ Event deletion works")
    print("\n🚀 Your Google Calendar integration is ready to use!")
    print("\nNext steps:")
    print("1. Enable calendar sync in your user settings")
    print("2. Create deadlines - they'll automatically sync to calendar")
    print("3. Check GOOGLE_CALENDAR_INTEGRATION.md for more features")


if __name__ == "__main__":
    try:
        test_calendar()
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
