import React, { useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import toast from "react-hot-toast";
import { useGetPropertyByIdQuery } from "../store/api/propertyApi";
import { useGetLeaseQuoteQuery } from "../store/api/leaseApi";
import { useCreateApplicationMutation } from "../store/api/applicationApi";
import { HiOutlineHome, HiOutlineShieldCheck } from "react-icons/hi";
import { useGetAvailabilityQuery } from "../store/api/bookingApi";
import BookingCalendar from "../components/BookingCalendar";

const EMPLOYMENT = ["employed", "self-employed", "student", "retired", "unemployed"];

const ApplyForLease = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: propData, isLoading: propLoading } = useGetPropertyByIdQuery(id);
  const property = propData?.property;

  const [form, setForm] = useState({
    employmentStatus: "employed",
    employer: "",
    jobTitle: "",
    monthlyIncome: "",
    currentAddress: "",
    desiredMoveIn: "",
    desiredTermMonths: 12,
    pets: "",
    message: "",
    coApplicantName: "",
    coApplicantEmail: "",
    guarantorName: "",
    guarantorEmail: "",
    screeningConsent: false,
  });

  const { data: quoteData } = useGetLeaseQuoteQuery(
    { propertyId: id, startDate: form.desiredMoveIn, termMonths: form.desiredTermMonths },
    { skip: !form.desiredMoveIn }
  );
  const quote = quoteData?.quote;

  const [createApplication, { isLoading }] = useCreateApplicationMutation();

  // ====== Dates already taken by a booking, a lease or a host block
  const { data: availData } = useGetAvailabilityQuery(id, { skip: !id });
  const unavailableDates = useMemo(() => {
    if (!availData?.data) return [];
    const dates = [];
    for (const item of availData.data) {
      const cursor = new Date(item.checkInDate);
      const end = new Date(item.checkOutDate);
      while (cursor < end) {
        const month = `${cursor.getMonth() + 1}`.padStart(2, "0");
        const day = `${cursor.getDate()}`.padStart(2, "0");
        dates.push(`${cursor.getFullYear()}-${month}-${day}`);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return dates;
  }, [availData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.monthlyIncome) return toast.error("Monthly income is required", { position: "top-center" });
    if (!form.desiredMoveIn) return toast.error("Pick a move-in date", { position: "top-center" });
    if (!form.screeningConsent) return toast.error("Screening consent is required to apply", { position: "top-center" });

    try {
      const res = await createApplication({
        propertyId: id,
        employmentStatus: form.employmentStatus,
        employer: form.employer,
        jobTitle: form.jobTitle,
        monthlyIncome: Number(form.monthlyIncome),
        currentAddress: form.currentAddress,
        desiredMoveIn: form.desiredMoveIn,
        desiredTermMonths: Number(form.desiredTermMonths),
        pets: form.pets,
        message: form.message,
        coApplicants: form.coApplicantName
          ? [{ fullName: form.coApplicantName, email: form.coApplicantEmail }]
          : [],
        guarantor: form.guarantorName
          ? { fullName: form.guarantorName, email: form.guarantorEmail }
          : undefined,
        screeningConsent: true,
      }).unwrap();

      toast.success(res.message || "Application submitted", { position: "top-center" });
      setTimeout(() => navigate("/my-applications"), 1200);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err?.message || "Could not submit that application", { position: "top-center" });
    }
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#f0506e] transition-colors";
  const labelClass = "block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1.5";

  if (propLoading) {
    return <div className="pt-32 pb-24 text-center text-gray-400 font-bold text-sm">Loading property...</div>;
  }

  if (!property) {
    return (
      <div className="pt-32 pb-24 text-center font-sans">
        <h2 className="text-xl font-bold text-gray-800">Property not found</h2>
        <Link to="/properties" className="text-[#f0506e] text-sm hover:underline mt-2 inline-block">Back to explore</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-extrabold text-gray-900">
          Apply to <span className="text-[#f0506e]">rent</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">{property.title} — {property.city}, {property.country}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* ====== Employment ====== */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">About you</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Employment status</label>
                <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} className={inputClass}>
                  {EMPLOYMENT.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Monthly income ($) *</label>
                <input type="number" name="monthlyIncome" min="0" value={form.monthlyIncome} onChange={handleChange} className={inputClass} placeholder="e.g. 5200" />
              </div>
              <div>
                <label className={labelClass}>Employer</label>
                <input type="text" name="employer" value={form.employer} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Job title</label>
                <input type="text" name="jobTitle" value={form.jobTitle} onChange={handleChange} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Current address</label>
                <input type="text" name="currentAddress" value={form.currentAddress} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ====== Move-in date ====== */}
          <BookingCalendar
            label="Pick your move-in date"
            value={form.desiredMoveIn}
            onChange={(dateStr) => setForm((prev) => ({ ...prev, desiredMoveIn: dateStr }))}
            unavailableDates={unavailableDates}
            minDate={property.availableFrom ? String(property.availableFrom).slice(0, 10) : undefined}
          />

          {/* ====== Term ====== */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">The tenancy you want</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Term (months)</label>
                <input type="number" name="desiredTermMonths" min="1" value={form.desiredTermMonths} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pets</label>
                <input type="text" name="pets" value={form.pets} onChange={handleChange} className={inputClass} placeholder="None" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Anything the landlord should know</label>
              <textarea name="message" rows="3" value={form.message} onChange={handleChange} className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* ====== Household ====== */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Co-applicant and guarantor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Co-applicant name</label>
                <input type="text" name="coApplicantName" value={form.coApplicantName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Co-applicant email</label>
                <input type="email" name="coApplicantEmail" value={form.coApplicantEmail} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Guarantor name</label>
                <input type="text" name="guarantorName" value={form.guarantorName} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Guarantor email</label>
                <input type="email" name="guarantorEmail" value={form.guarantorEmail} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ====== Consent ====== */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.screeningConsent}
                onChange={(e) => setForm({ ...form, screeningConsent: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-[#f0506e] cursor-pointer shrink-0"
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to a <b className="text-gray-900">credit, background and eviction check</b> being run on this
                application. My consent is recorded with the date and time it was given.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#f0506e] hover:bg-[#d94560] text-white rounded-2xl py-4 text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Submitting..." : "Submit application"}
          </button>
        </form>

        {/* ====== Terms sidebar ====== */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-6 sticky top-24 space-y-4">
            <img src={property.thumbnail} alt={property.title} className="w-full h-32 object-cover rounded-2xl" />

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <HiOutlineHome className="w-4 h-4 text-[#f0506e]" />
              <span className="font-semibold">{property.bedrooms} bed · {property.bathrooms} bath</span>
            </div>

            {quote ? (
              <div className="space-y-2.5 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Monthly rent</span><span className="font-bold text-gray-900">${quote.monthlyRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Security deposit</span><span className="font-bold text-gray-900">${quote.securityDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Term</span><span className="font-bold text-gray-900">{quote.months} months</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Contract value</span><span className="font-bold text-gray-900">${quote.totalContractValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2.5 border-t border-gray-100 text-sm font-extrabold text-gray-900">
                  <span>Due at signing</span><span>${quote.dueNow.toLocaleString()}</span>
                </div>
                {quote.utilitiesIncluded && (
                  <p className="text-[10px] text-green-600 font-semibold">Utilities included</p>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 font-semibold pt-3 border-t border-gray-100">
                Pick a move-in date to see the full terms.
              </p>
            )}

            <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
              <HiOutlineShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Applying does not commit you. The landlord reviews and may offer a lease, which you sign separately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyForLease;
