import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image, pdf } from '@react-pdf/renderer'

// Register fonts if needed
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', fontWeight: 700 },
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Roboto',
  },
  container: {
    border: '3 solid #2563eb',
    borderRadius: 10,
    padding: 30,
    height: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  certifyText: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    marginVertical: 20,
  },
  donorName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#111827',
    textAlign: 'center',
    marginVertical: 15,
    textDecoration: 'underline',
  },
  contributionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 1.6,
    marginVertical: 10,
  },
  amount: {
    fontSize: 32,
    fontWeight: 700,
    color: '#059669',
    textAlign: 'center',
    marginVertical: 20,
  },
  message: {
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 5,
    marginVertical: 20,
  },
  messageText: {
    fontSize: 11,
    color: '#4b5563',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 30,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  signature: {
    alignItems: 'center',
    flex: 1,
  },
  signatureLine: {
    width: '80%',
    borderBottom: '1 solid #9ca3af',
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  certificateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
  },
  infoText: {
    fontSize: 9,
    color: '#9ca3af',
  },
  watermark: {
    position: 'absolute',
    fontSize: 100,
    color: '#e5e7eb',
    opacity: 0.1,
    transform: 'rotate(-45deg)',
    top: '40%',
    left: '15%',
  },
})

interface CertificateData {
  donorName: string
  amount: string
  currency: string
  date: string
  message?: string
  certificateId: string
  locale: 'en' | 'pt'
}

export const DonationCertificate: React.FC<{ data: CertificateData }> = ({ data }) => {
  const texts = {
    en: {
      title: 'Certificate of Donation',
      subtitle: 'Dr. José Gomes Medical Recovery Fund',
      certify: 'This certifies that',
      hasContributed: 'has generously contributed',
      toSupport: 'to support the medical treatment and recovery of Dr. José Gomes de Oliveira',
      thankyou: 'Your kindness and generosity are deeply appreciated by the Gomes family.',
      date: 'Date of Donation',
      certificateId: 'Certificate ID',
      organizer: 'Campaign Organizer',
      family: 'The Gomes Family',
      notTaxDeductible: 'This is a personal gift and is not tax-deductible',
    },
    pt: {
      title: 'Certificado de Doação',
      subtitle: 'Fundo de Recuperação Médica Dr. José Gomes',
      certify: 'Este certificado atesta que',
      hasContributed: 'contribuiu generosamente com',
      toSupport: 'para apoiar o tratamento médico e recuperação do Dr. José Gomes de Oliveira',
      thankyou: 'Sua bondade e generosidade são profundamente apreciadas pela família Gomes.',
      date: 'Data da Doação',
      certificateId: 'ID do Certificado',
      organizer: 'Organizador da Campanha',
      family: 'Família Gomes',
      notTaxDeductible: 'Este é um presente pessoal e não é dedutível de impostos',
    },
  }

  const t = texts[data.locale]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Watermark */}
          <Text style={styles.watermark}>THANK YOU</Text>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          {/* Body */}
          <Text style={styles.certifyText}>{t.certify}</Text>
          
          <Text style={styles.donorName}>{data.donorName}</Text>
          
          <Text style={styles.contributionText}>{t.hasContributed}</Text>
          
          <Text style={styles.amount}>
            {data.currency === 'USD' ? '$' : 'R$'}{data.amount}
          </Text>
          
          <Text style={styles.contributionText}>{t.toSupport}</Text>

          {/* Message if provided */}
          {data.message && (
            <View style={styles.message}>
              <Text style={styles.messageText}>"{data.message}"</Text>
            </View>
          )}

          <Text style={styles.contributionText}>{t.thankyou}</Text>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.signatureSection}>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>{t.organizer}</Text>
                <Text style={styles.signatureLabel}>{t.family}</Text>
              </View>
            </View>

            <View style={styles.certificateInfo}>
              <Text style={styles.infoText}>
                {t.date}: {data.date}
              </Text>
              <Text style={styles.infoText}>
                {t.certificateId}: {data.certificateId}
              </Text>
            </View>

            <Text style={[styles.infoText, { textAlign: 'center', marginTop: 10 }]}>
              {t.notTaxDeductible}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// Helper function to generate PDF blob
export async function generateCertificatePDF(data: CertificateData): Promise<Blob> {
  const doc = <DonationCertificate data={data} />
  const blob = await pdf(doc).toBlob()
  return blob
}

// Helper function to download PDF
export async function downloadCertificate(data: CertificateData) {
  const blob = await generateCertificatePDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `donation-certificate-${data.certificateId}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}