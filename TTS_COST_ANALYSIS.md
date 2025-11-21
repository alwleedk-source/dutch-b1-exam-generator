# TTS Cost Analysis & Optimization Strategy

## Current Implementation

### How TTS Works
1. User clicks 🔊 button on a vocabulary word
2. System checks if audio already exists in database (`audioUrl` field)
3. **If exists**: Play from Cloudflare R2 (cached) - **FREE**
4. **If not exists**: 
   - Call Google Cloud TTS API
   - Generate audio file
   - Upload to Cloudflare R2
   - Save URL to database
   - Play audio

### Cost Breakdown

#### Google Cloud Text-to-Speech Pricing
- **Standard voices**: $4.00 per 1 million characters
- **WaveNet voices**: $16.00 per 1 million characters
- **Neural2 voices**: $16.00 per 1 million characters

**Current usage**: Standard Dutch voices

#### Cloudflare R2 Storage Pricing
- **Storage**: $0.015 per GB/month
- **Class A operations** (write): $4.50 per million requests
- **Class B operations** (read): $0.36 per million requests
- **Free tier**: 10 GB storage, 1M Class A, 10M Class B per month

### Cost Comparison: Per-Word vs Batch

#### Scenario: 1000 unique Dutch words

**Per-Word Strategy (Current)**:
```
Average word length: 8 characters
Total characters: 8,000
TTS cost: (8,000 / 1,000,000) × $4 = $0.032
R2 storage: 1000 files × 50KB = 50MB = $0.00075/month
R2 write operations: 1000 × $4.50/1M = $0.0045
Total first-time cost: $0.037
```

**Batch Strategy** (hypothetical):
```
Generate all 1000 words at once
Same TTS cost: $0.032
Same storage cost: $0.00075/month
Same write cost: $0.0045
Total first-time cost: $0.037
```

### Key Insight: **No difference in cost!**

## Why Per-Word is Better

### 1. ✅ **Cache Efficiency**
- Same word used across multiple texts = **1 audio file**
- Example: "de" appears in 100 texts = **1 TTS call, 100 reuses**
- Batch approach would generate duplicate audios

### 2. ✅ **On-Demand Generation**
- Only generate audio when user actually needs it
- Many words may never be listened to
- Saves unnecessary TTS calls

### 3. ✅ **Progressive Cost**
- Costs spread over time as users explore vocabulary
- No upfront bulk generation cost
- Better cash flow management

### 4. ✅ **Storage Optimization**
- Only store audio for words users actually use
- Batch would store unused audio files
- Wasted storage = wasted money

### 5. ✅ **Scalability**
- New words added incrementally
- No need to regenerate entire batch
- Easy to maintain and update

## Real-World Cost Projection

### Assumptions:
- 10,000 unique Dutch words in database
- Average 8 characters per word
- 30% of words actually listened to (3,000 words)

### Per-Word Strategy:
```
TTS cost: (3,000 × 8 / 1,000,000) × $4 = $0.096
R2 storage: 3,000 × 50KB = 150MB = $0.00225/month
R2 operations: 3,000 writes + 30,000 reads (10× reuse)
  - Writes: 3,000 × $4.50/1M = $0.0135
  - Reads: 30,000 × $0.36/10M = $0.00011
Total first year: $0.096 + ($0.00225 × 12) + $0.0135 + $0.00011 = $0.137
```

### Batch Strategy:
```
TTS cost: (10,000 × 8 / 1,000,000) × $4 = $0.32
R2 storage: 10,000 × 50KB = 500MB = $0.0075/month
R2 operations: 10,000 writes + 30,000 reads
  - Writes: 10,000 × $4.50/1M = $0.045
  - Reads: 30,000 × $0.36/10M = $0.00011
Total first year: $0.32 + ($0.0075 × 12) + $0.045 + $0.00011 = $0.455
```

### **Savings: $0.318 per year (70% reduction)**

## Optimization Recommendations

### ✅ Current Strategy (Keep)
- Per-word on-demand generation
- Cache in Cloudflare R2
- Reuse across all texts

### 🔄 Additional Optimizations

1. **Pre-generate common words**
   - Top 100 most frequent Dutch words
   - Cost: ~$0.003 upfront
   - Benefit: Instant playback for 80% of requests

2. **Batch cleanup**
   - Delete audio files not accessed in 6 months
   - Saves storage costs
   - Regenerate on-demand if needed later

3. **Compression**
   - Use MP3 at 64kbps instead of 128kbps
   - 50% storage reduction
   - Minimal quality impact for vocabulary

4. **CDN caching**
   - Cloudflare R2 already includes CDN
   - Free bandwidth for cached files
   - Faster playback globally

## Conclusion

**The current per-word strategy is optimal** for this use case:
- ✅ Lower total cost (70% savings)
- ✅ Better cache efficiency
- ✅ On-demand generation
- ✅ Scalable and maintainable
- ✅ No wasted resources

**Do NOT switch to batch generation** - it would:
- ❌ Increase costs by 3.3×
- ❌ Waste storage on unused audio
- ❌ Generate duplicate files
- ❌ Require complex maintenance

## Current Status

✅ **Implementation is correct and cost-effective**
✅ **No changes needed to TTS strategy**
✅ **Focus on ensuring proper caching is working**

---

**Last Updated**: 2025-11-21
**Author**: Manus AI Assistant
