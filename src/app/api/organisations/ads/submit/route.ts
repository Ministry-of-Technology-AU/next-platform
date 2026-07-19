import { NextResponse } from 'next/server';
import { strapiPost, strapiPut } from '@/lib/apis/strapi';
import { uploadImageToCloudinary } from '@/lib/apis/cloudinary';
import { sendMail } from '@/lib/apis/mail';
import { auth } from '@/auth';
import { getUserIdByEmail, getOrganisationIdByUserId } from '@/lib/userid';

export async function POST(request: Request) {
    try {
        const session = await auth();
        const email = session?.user?.email;

        if (!email) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        const userId = await getUserIdByEmail(email);

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found in system' },
                { status: 404 }
            );
        }

        const organisationId = await getOrganisationIdByUserId(userId);

        if (!organisationId) {
            return NextResponse.json(
                { success: false, error: 'You must be part of an organisation to submit ads' },
                { status: 403 }
            );
        }

        const formData = await request.formData();

        const id = formData.get('id') as string | null;
        const title = formData.get('title') as string;
        const subtitle = formData.get('subtitle') as string;
        const description = formData.get('description') as string;
        const gradient = formData.get('gradient') as string;
        const buttons = formData.get('buttons') as string;
        const order = formData.get('order') as string;
        const imageFile = formData.get('image') as File | null;
        const startDate = formData.get('start_date') as string | null;
        const endDate = formData.get('end_date') as string | null;
        const titleStyle = formData.get('title_style') as string | null;
        const subtitleStyle = formData.get('subtitle_style') as string | null;
        const descriptionStyle = formData.get('description_style') as string | null;

        // If image is provided, upload to Cloudinary
        let bannerUrl = formData.get('banner_url') as string | null;
        if (imageFile && imageFile.size > 0) {
            try {
                const { url } = await uploadImageToCloudinary(
                    imageFile,
                    `ad-banner-${Date.now()}-${imageFile.name}`
                );
                bannerUrl = url;
            } catch (error) {
                console.error('Cloudinary upload failed:', error);
                return NextResponse.json(
                    { success: false, error: 'Image upload failed' },
                    { status: 500 }
                );
            }
        }

        if (!bannerUrl) {
            return NextResponse.json(
                { success: false, error: 'Banner image is required' },
                { status: 400 }
            );
        }

        let parsedButtons = [];
        if (buttons) {
            try {
                parsedButtons = JSON.parse(buttons);
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        // Parse style JSONs
        let parsedTitleStyle = null;
        let parsedSubtitleStyle = null;
        let parsedDescriptionStyle = null;
        try { if (titleStyle) parsedTitleStyle = JSON.parse(titleStyle); } catch (e) { /* ignore */ }
        try { if (subtitleStyle) parsedSubtitleStyle = JSON.parse(subtitleStyle); } catch (e) { /* ignore */ }
        try { if (descriptionStyle) parsedDescriptionStyle = JSON.parse(descriptionStyle); } catch (e) { /* ignore */ }

        const adData: Record<string, any> = {
            data: {
                title: title || '',
                subtitle: subtitle || '',
                description: description || '',
                gradient: gradient || '',
                buttons: parsedButtons,
                order: parseInt(order) || 0,
                banner_url: bannerUrl,
                organisation: organisationId,
                publishedAt: null, // Keep as draft - admin must manually publish
                start_date: startDate || null,
                end_date: endDate || null,
                title_style: parsedTitleStyle,
                subtitle_style: parsedSubtitleStyle,
                description_style: parsedDescriptionStyle,
            }
        };

        const numericId = id ? parseInt(id) : NaN;
        const isRealStrapiId = id &&
            id !== 'null' &&
            id !== 'undefined' &&
            !isNaN(numericId) &&
            numericId > 0 &&
            numericId < 10000;

        let response;
        if (isRealStrapiId) {
            response = await strapiPut(`/advertisements/${id}`, adData);
        } else {
            response = await strapiPost('/advertisements', adData);
        }

        // Build email
        const senderName = session?.user?.name?.toString().trim() || 'Anonymous';
        const senderEmail = session?.user?.email?.toString().trim() || '';

        const escapeHtml = (str: string) =>
            str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');

        const buttonDetails = parsedButtons.map((btn: any, idx: number) =>
            `<li><strong>Button ${idx + 1}:</strong> "${escapeHtml(btn.children || '')}" → <a href="${escapeHtml(btn.url || '')}">${escapeHtml(btn.url || '')}</a> (Variant: ${escapeHtml(btn.variant || 'default')})</li>`
        ).join('');

        const formatDate = (d: string | null) => {
            if (!d) return 'Not set';
            try { return new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }); }
            catch { return d; }
        };

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
                    🎯 New Advertisement Submitted
                </h2>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Submitted by:</strong> ${escapeHtml(senderName)} &lt;${escapeHtml(senderEmail || 'Not provided')}&gt;</p>
                    <p style="margin: 5px 0;"><strong>Submission Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                </div>

                <h3 style="color: #1f2937; margin-top: 25px;">Ad Details</h3>
                
                <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold; width: 150px;">Title</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(title || '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Subtitle</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(subtitle || '')}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Description</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(description || '')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Order</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(order || '0')}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Start Date</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatDate(startDate)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">End Date</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${formatDate(endDate)}</td>
                    </tr>
                    <tr style="background: #f9fafb;">
                        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: bold;">Gradient</td>
                        <td style="padding: 12px; border: 1px solid #e5e7eb;">${escapeHtml(gradient || 'None')}</td>
                    </tr>
                </table>

                ${parsedButtons.length > 0 ? `
                    <h3 style="color: #1f2937; margin-top: 25px;">Call-to-Action Buttons</h3>
                    <ul style="list-style: none; padding: 0;">
                        ${buttonDetails}
                    </ul>
                ` : ''}

                <h3 style="color: #1f2937; margin-top: 25px;">Banner Image</h3>
                <p style="margin: 10px 0;">
                    <a href="${escapeHtml(bannerUrl)}" style="color: #2563eb; text-decoration: none;">View Banner Image →</a>
                </p>
                <div style="margin: 15px 0; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <img src="${escapeHtml(bannerUrl)}" alt="Ad Banner" style="width: 100%; height: auto; display: block;" />
                </div>

                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    <em>This ad has been saved as a draft. You can review and publish it from the Strapi admin panel.</em>
                </p>
            </div>
        `;

        const emailText = `
New Advertisement Submitted

Submitted by: ${senderName} <${senderEmail || 'Not provided'}>
Submission Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

=== Ad Details ===
Title: ${title || ''}
Subtitle: ${subtitle || ''}
Description: ${description || ''}
Order: ${order || '0'}
Start Date: ${formatDate(startDate)}
End Date: ${formatDate(endDate)}
Gradient: ${gradient || 'None'}

${parsedButtons.length > 0 ? `=== Call-to-Action Buttons ===\n${parsedButtons.map((btn: any, idx: number) =>
            `Button ${idx + 1}: "${btn.children || ''}" → ${btn.url || ''} (Variant: ${btn.variant || 'default'})`
        ).join('\n')}` : ''}

=== Banner Image ===
View at: ${bannerUrl}

---
This ad has been saved as a draft. You can review and publish it from the Strapi admin panel.
        `;

        const recipientEmail = process.env.TECHMAIL_ID;
        if (!recipientEmail) {
            console.warn('TECHMAIL_ID not configured, skipping email notification');
        } else {
            try {
                await sendMail({
                    to: recipientEmail,
                    subject: 'Platform - new Ad raised',
                    html: emailHtml,
                    text: emailText,
                    replyTo: senderEmail || undefined,
                    alias: 'Platform Ads',
                });
            } catch (emailError) {
                console.error('Failed to send email notification:', emailError);
                // Don't fail the entire request if email fails
            }
        }

        return NextResponse.json({
            success: true,
            data: response.data,
            message: 'Ad submitted successfully and email notification sent'
        });

    } catch (error) {
        console.error('Error submitting ad:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Failed to submit ad' },
            { status: 500 }
        );
    }
}
