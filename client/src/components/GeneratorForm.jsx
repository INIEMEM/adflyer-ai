export default function GeneratorForm({ formData, onChange, onSubmit, loading }) {
  return (
    <div className="form-wrapper">
      <div className="form-card">
        <h2 className="form-card-title">
          Your <span>Business</span> Details
        </h2>

        <form onSubmit={onSubmit}>
          <div className="form-grid">
            {/* Business Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="businessName">Business Name</label>
              <input
                id="businessName"
                className="form-input"
                type="text"
                placeholder="e.g. Mama Rosa's Kitchen"
                value={formData.businessName}
                onChange={e => onChange('businessName', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Business Type */}
            <div className="form-group">
              <label className="form-label" htmlFor="businessType">Business Type</label>
              <input
                id="businessType"
                className="form-input"
                type="text"
                placeholder="e.g. Restaurant, Salon, Tech Startup"
                value={formData.businessType}
                onChange={e => onChange('businessType', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Product or Service */}
            <div className="form-group full">
              <label className="form-label" htmlFor="productOrService">Product or Service</label>
              <textarea
                id="productOrService"
                className="form-textarea"
                placeholder="Describe what you offer — be as specific as possible for better results"
                value={formData.productOrService}
                onChange={e => onChange('productOrService', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Target Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="targetLocation">Target City or Country</label>
              <input
                id="targetLocation"
                className="form-input"
                type="text"
                placeholder="e.g. Lagos, Nigeria"
                value={formData.targetLocation}
                onChange={e => onChange('targetLocation', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Contact Info */}
            <div className="form-group">
              <label className="form-label" htmlFor="contactInfo">Contact Information</label>
              <input
                id="contactInfo"
                className="form-input"
                type="text"
                placeholder="Phone, email, website"
                value={formData.contactInfo}
                onChange={e => onChange('contactInfo', e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Special Offer (optional) */}
            <div className="form-group full">
              <label className="form-label" htmlFor="specialOffer">
                Special Offer
                <span className="optional">(optional)</span>
              </label>
              <input
                id="specialOffer"
                className="form-input"
                type="text"
                placeholder="e.g. Buy 2 get 1 free this weekend only!"
                value={formData.specialOffer}
                onChange={e => onChange('specialOffer', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <div className="form-group full">
              <button
                id="generate-btn"
                type="submit"
                className="btn-generate"
                disabled={loading}
              >
                ⚡ Generate Advertisement
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
