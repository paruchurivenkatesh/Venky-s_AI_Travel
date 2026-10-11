import os
import io
from datetime import datetime
from typing import Dict, Any
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from app.services.currency_service import format_inr

class PDFService:
    def generate_trip_pdf(self, trip_data: Dict[str, Any]) -> io.BytesIO:
        """
        Generates a professionally designed, comprehensive PDF travel report
        for the given trip with Venky's AI Travel branding, budget breakdowns,
        day-by-day timeline, and grounding disclosures.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom palette matching Venky's AI Travel theme
        primary_color = colors.HexColor("#0f172a") # Deep Slate
        saffron_accent = colors.HexColor("#d97706") # Indian Saffron Amber
        emerald_accent = colors.HexColor("#059669") # Emerald Green
        light_bg = colors.HexColor("#f8fafc")
        border_color = colors.HexColor("#e2e8f0")
        text_muted = colors.HexColor("#64748b")

        # Typography Styles
        title_style = ParagraphStyle(
            'BrandTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=primary_color
        )
        tagline_style = ParagraphStyle(
            'BrandTagline',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=11,
            leading=14,
            textColor=saffron_accent
        )
        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=primary_color,
            spaceBefore=14,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#1e293b")
        )
        body_muted = ParagraphStyle(
            'BodyMuted',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=text_muted
        )
        bold_style = ParagraphStyle(
            'Bold',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        story = []

        # 1. Header Banner
        destination = trip_data.get("destination", "Incredible India")
        origin = trip_data.get("origin_city", "India")
        duration = trip_data.get("duration_days", 4)
        travelers = trip_data.get("travelers_count", 2)
        style = trip_data.get("travel_style", "Standard")

        header_data = [
            [
                Paragraph("<b>VENKY'S AI TRAVEL</b>", title_style),
                Paragraph(f"<b>PLAN ID:</b> #{trip_data.get('id', 'VAI')[:8].upper()}<br/><font color='#64748b'>Date: {datetime.now().strftime('%d %b %Y')}</font>", ParagraphStyle('HRight', parent=body_style, alignment=2))
            ],
            [
                Paragraph("<i>Your AI-Powered India Travel Planner · Multi-Agent Verified Plan</i>", tagline_style),
                Paragraph(f"<font color='#059669'><b>Status: Verified India Plan</b></font>", ParagraphStyle('HRight2', parent=body_style, alignment=2))
            ]
        ]
        header_table = Table(header_data, colWidths=[340, 180])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1.5, color=saffron_accent, spaceBefore=8, spaceAfter=12))

        # 2. Trip Overview Card
        overview_data = [
            [
                Paragraph("<b>Destination:</b>", bold_style), Paragraph(f"{destination} ({trip_data.get('destination_details', {}).get('state_name', 'India')})", body_style),
                Paragraph("<b>Origin:</b>", bold_style), Paragraph(origin, body_style)
            ],
            [
                Paragraph("<b>Duration:</b>", bold_style), Paragraph(f"{duration} Days / {max(1, duration-1)} Nights", body_style),
                Paragraph("<b>Travelers:</b>", bold_style), Paragraph(f"{travelers} Person(s)", body_style)
            ],
            [
                Paragraph("<b>Travel Style:</b>", bold_style), Paragraph(style, body_style),
                Paragraph("<b>Accommodation:</b>", bold_style), Paragraph(trip_data.get('accommodation_pref', '3 Star'), body_style)
            ]
        ]
        overview_table = Table(overview_data, colWidths=[90, 170, 90, 170])
        overview_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), light_bg),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(overview_table)
        story.append(Spacer(1, 10))

        # 3. Budget Section
        budget = trip_data.get("budget_breakdown", {})
        predicted_total = budget.get("predicted_total", 0.0)
        per_person = budget.get("per_person", predicted_total / max(1, travelers))
        per_day = budget.get("per_day", predicted_total / max(1, duration))
        conf = budget.get("overall_confidence", 91)
        grounding_ratio = budget.get("grounding_ratio", 78)

        story.append(Paragraph("AI-PREDICTED TRIP BUDGET", h2_style))
        
        budget_summary_data = [
            [
                Paragraph(f"<font size=16 color='#0f172a'><b>{format_inr(predicted_total)}</b></font><br/><font size=8 color='#64748b'>TOTAL PREDICTED BUDGET</font>", ParagraphStyle('C1', parent=body_style, alignment=1)),
                Paragraph(f"<font size=16 color='#0f172a'><b>{format_inr(per_person)}</b></font><br/><font size=8 color='#64748b'>PER PERSON</font>", ParagraphStyle('C2', parent=body_style, alignment=1)),
                Paragraph(f"<font size=16 color='#0f172a'><b>{format_inr(per_day)}</b></font><br/><font size=8 color='#64748b'>DAILY AVERAGE</font>", ParagraphStyle('C3', parent=body_style, alignment=1)),
                Paragraph(f"<font size=16 color='#059669'><b>{conf}%</b></font><br/><font size=8 color='#64748b'>CONFIDENCE ({grounding_ratio}% Grounded)</font>", ParagraphStyle('C4', parent=body_style, alignment=1))
            ]
        ]
        budget_summary_table = Table(budget_summary_data, colWidths=[130, 130, 130, 130])
        budget_summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#ecfdf5")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#a7f3d0")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#a7f3d0")),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(budget_summary_table)
        story.append(Spacer(1, 8))

        # Detailed Budget Table
        bd_data = [
            [
                Paragraph("<b>Cost Category</b>", bold_style),
                Paragraph("<b>Predicted Amount</b>", bold_style),
                Paragraph("<b>Share (%)</b>", bold_style),
                Paragraph("<b>Source / Grounding Type</b>", bold_style)
            ],
            [
                Paragraph("Intercity & Outstation Transport", body_style),
                Paragraph(format_inr(budget.get("transport_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('transport_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("Railways / Airfare Grounded Database", body_muted)
            ],
            [
                Paragraph("Accommodation & Stays", body_style),
                Paragraph(format_inr(budget.get("accommodation_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('accommodation_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("Koson India Hotel API / Grounded", body_muted)
            ],
            [
                Paragraph("Local Cuisine & Dining", body_style),
                Paragraph(format_inr(budget.get("food_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('food_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("Regional Expenditure Grounding", body_muted)
            ],
            [
                Paragraph("Intra-City & Local Transit", body_style),
                Paragraph(format_inr(budget.get("local_transport_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('local_transport_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("Local Auto/Metro/Taxi Tariffs", body_muted)
            ],
            [
                Paragraph("Attractions & Activity Entry Fees", body_style),
                Paragraph(format_inr(budget.get("activities_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('activities_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("Official ASI / State Ticket Tariffs", body_muted)
            ],
            [
                Paragraph("Contingency & Emergency Buffer", body_style),
                Paragraph(format_inr(budget.get("buffer_cost", 0)), body_style),
                Paragraph(f"{round((budget.get('buffer_cost', 0)/max(1, predicted_total))*100)}%", body_style),
                Paragraph("AI Recommended 5-8% Buffer", body_muted)
            ]
        ]
        bd_table = Table(bd_data, colWidths=[180, 110, 70, 160])
        bd_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ('BOX', (0, 0), (-1, -1), 0.5, border_color),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(bd_table)
        story.append(Spacer(1, 12))

        # 4. Recommended Accommodation
        hotels = trip_data.get("hotels", [])
        if hotels:
            story.append(Paragraph("RECOMMENDED STAYS & HOTELS", h2_style))
            hotel_data = [[
                Paragraph("<b>Hotel Name</b>", bold_style),
                Paragraph("<b>Category</b>", bold_style),
                Paragraph("<b>Location</b>", bold_style),
                Paragraph("<b>Price / Night</b>", bold_style),
                Paragraph("<b>Rating</b>", bold_style)
            ]]
            for h in hotels[:3]:
                hotel_data.append([
                    Paragraph(f"<b>{h.get('name', 'Hotel')}</b>", body_style),
                    Paragraph(h.get('category', '3 Star'), body_style),
                    Paragraph(h.get('location', destination), body_muted),
                    Paragraph(format_inr(h.get('price_per_night', 2500)), body_style),
                    Paragraph(f"★ {h.get('rating', 4.3)}/5.0", body_style)
                ])
            h_table = Table(hotel_data, colWidths=[160, 80, 140, 80, 60])
            h_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
                ('BOX', (0, 0), (-1, -1), 0.5, border_color),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(h_table)
            story.append(Spacer(1, 12))

        # 5. Day-by-Day Detailed Itinerary
        itinerary_days = trip_data.get("itinerary_days", [])
        if itinerary_days:
            story.append(Paragraph("DAY-BY-DAY ITINERARY", h2_style))
            for day in itinerary_days:
                day_num = day.get("day_number", 1)
                day_title = day.get("title", f"Day {day_num}")
                theme = day.get("theme", "Exploration")
                day_cost = format_inr(day.get("daily_estimated_cost", 0))

                day_elements = []
                day_elements.append(Paragraph(
                    f"<b>DAY {day_num}: {day_title}</b> &nbsp;|&nbsp; <i>Theme: {theme}</i> &nbsp;|&nbsp; Est. Spend: {day_cost}",
                    ParagraphStyle('DayHeader', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#1e3a8a"))
                ))
                
                activities = day.get("activities", [])
                for act in activities:
                    time_slot = act.get("time_slot", "Morning")
                    title = act.get("activity_title", "")
                    loc = act.get("location_name", "")
                    approx_t = act.get("approx_time", "")
                    cost = format_inr(act.get("estimated_cost", 0)) if act.get("estimated_cost") else "Free"
                    desc = act.get("description", "")

                    act_text = f"<b>[{time_slot.upper()} - {approx_t}] {title}</b> at {loc} ({cost})<br/>"
                    if desc:
                        act_text += f"<font color='#475569'>{desc}</font>"
                    day_elements.append(Paragraph(act_text, ParagraphStyle('Act', parent=body_style, leftIndent=12, spaceBefore=2, spaceAfter=2)))

                if day.get("lunch_recommendation"):
                    day_elements.append(Paragraph(f"🍽 <b>Lunch Suggestion:</b> {day.get('lunch_recommendation')}", ParagraphStyle('Meal', parent=body_muted, leftIndent=12)))
                if day.get("dinner_recommendation"):
                    day_elements.append(Paragraph(f"🌙 <b>Dinner Suggestion:</b> {day.get('dinner_recommendation')}", ParagraphStyle('Meal2', parent=body_muted, leftIndent=12)))

                day_elements.append(Spacer(1, 8))
                story.append(KeepTogether(day_elements))

        # 6. Famous Food & Culture
        dest_details = trip_data.get("destination_details", {})
        famous_food = dest_details.get("famous_food_json", [])
        if famous_food:
            story.append(Spacer(1, 6))
            story.append(Paragraph("AUTHENTIC LOCAL FOOD SPECIALTIES", h2_style))
            for food in famous_food[:4]:
                f_name = food.get("name", "")
                f_price = format_inr(food.get("typical_price", 150))
                f_spot = food.get("famous_spot", "Local Eateries")
                f_desc = food.get("desc", "")
                story.append(Paragraph(
                    f"• <b>{f_name}</b> (~{f_price}) - Best at <i>{f_spot}</i>: {f_desc}",
                    ParagraphStyle('FoodBullet', parent=body_style, leftIndent=8, spaceBefore=2)
                ))

        # 7. Disclaimers & Grounding Disclosure
        story.append(Spacer(1, 14))
        story.append(HRFlowable(width="100%", thickness=0.5, color=border_color, spaceBefore=4, spaceAfter=8))
        disclaimer_text = (
            "<b>DATA GROUNDING & VERIFICATION DISCLOSURE:</b><br/>"
            "This travel report was generated by <b>Venky's AI Travel Multi-Agent Engine</b>. "
            "Attractions, coordinates, and baseline fares are grounded against Indian open datasets, "
            "government tourism boards, and accommodation matrices. "
            "Travel prices, fuel surcharges, hotel availability, and ticket tariffs are dynamic and subject to seasonal fluctuation. "
            "Venky's AI Travel provides predictive planning estimates and should not be treated as a guaranteed commercial booking quote. "
            "Verify real-time tickets before final departure."
        )
        story.append(Paragraph(disclaimer_text, body_muted))
        story.append(Spacer(1, 6))
        story.append(Paragraph("Generated with pride by Venky's AI Travel · Incredible India", ParagraphStyle('Foot', parent=body_muted, alignment=1)))

        doc.build(story)
        buffer.seek(0)
        return buffer

pdf_service = PDFService()
