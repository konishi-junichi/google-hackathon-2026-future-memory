export type Language = 'en' | 'ja';

export type TranslationKey =
    | 'app.title'
    | 'login'
    | 'login.title'
    | 'login.username'
    | 'login.password'
    | 'login.placeholder.username'
    | 'login.btn'
    | 'login.no_account'
    | 'login.register_link'
    | 'login.loading'
    | 'register.title'
    | 'register.username'
    | 'register.password'
    | 'register.display_name'
    | 'register.age'
    | 'register.gender'
    | 'register.address'
    | 'register.indoor_outdoor'
    | 'register.hobbies'
    | 'register.btn'
    | 'register.have_account'
    | 'register.login_link'
    | 'register.loading'
    | 'register.placeholder.username'
    | 'register.placeholder.display_name'
    | 'register.placeholder.hobbies'
    | 'account.title'
    | 'account.logout'
    | 'account.edit_btn'
    | 'account.tab.profile'
    | 'account.tab.shared'
    | 'account.tab.mylist'
    | 'account.mylist.title'
    | 'account.shared.title'
    | 'account.no_mylist'
    | 'account.no_shared'
    | 'account.delete_confirm'
    | 'account.delete_shared_confirm'
    | 'account.update_success'
    | 'account.update_error'
    | 'account.profile_image'
    | 'account.gender.male'
    | 'account.gender.female'
    | 'account.gender.other'
    | 'account.gender.no_answer'
    | 'account.type.indoor'
    | 'account.type.outdoor'
    | 'account.type.both'
    | 'account.save_btn'
    | 'account.cancel_btn'
    | 'account.saving'
    | 'itinerary.login_required'
    | 'itinerary.edit.btn'
    | 'itinerary.edit.done'
    | 'itinerary.edit.add'
    | 'itinerary.edit.add_end'
    | 'itinerary.new_activity'
    | 'itinerary.share'
    | 'itinerary.share_confirm'
    | 'itinerary.status.save'
    | 'itinerary.concierge'
    | 'itinerary.favorite_success'
    | 'itinerary.favorite_duplicate'
    | 'itinerary.favorite_updated'
    | 'itinerary.sharing'
    | 'itinerary.saving'
    | 'itinerary.edit'
    | 'itinerary.done'
    | 'itinerary.share_success'
    | 'itinerary.share_duplicate'
    | 'itinerary.share_updated'
    | 'itinerary.share_error'
    | 'itinerary.save_success'
    | 'itinerary.save_duplicate'
    | 'itinerary.save_updated'
    | 'itinerary.save_error'
    | 'itinerary.delete_confirm'
    | 'social.details_btn'
    | 'social.keyword_label'
    | 'home.hero.title1'
    | 'home.hero.title2'
    | 'home.hero.desc'
    | 'home.mode.personal.title'
    | 'home.mode.personal.desc'
    | 'home.mode.social.title'
    | 'home.mode.social.desc'
    | 'home.cta'
    | 'feature.personalized.title'
    | 'feature.personalized.desc'
    | 'feature.visual.title'
    | 'feature.visual.desc'
    | 'feature.emotional.title'
    | 'feature.emotional.desc'
    | 'profile.title'
    | 'profile.subtitle'
    | 'profile.btn'
    | 'profile.mode.senior.title'
    | 'profile.mode.senior.desc'
    | 'profile.mode.solo.title'
    | 'profile.mode.solo.desc'
    | 'profile.mode.family.title'
    | 'profile.mode.family.desc'
    | 'profile.mode.influencer.title'
    | 'profile.mode.influencer.desc'
    | 'profile.mode.active.title'
    | 'profile.mode.active.desc'
    | 'profile.tags.title'
    | 'profile.attributes.title'
    | 'profile.attributes.placeholder'
    | 'proposal.title'
    | 'proposal.desc'
    | 'proposal.match'
    | 'proposal.watch'
    | 'proposal.loading.title'
    | 'proposal.loading.desc'
    | 'preview.back'
    | 'preview.playing'
    | 'preview.select'
    | 'preview.no_videos'
    | 'social.title'
    | 'social.desc'
    | 'social.placeholder'
    | 'social.searching'
    | 'social.search_btn'
    | 'social.results'
    | 'social.no_results'
    | 'common.by'
    | 'itinerary.title'
    | 'itinerary.subtitle'
    | 'itinerary.schedule'
    | 'itinerary.souvenir'
    | 'itinerary.souvenir.desc'
    | 'itinerary.loading.title'
    | 'itinerary.loading.desc'
    | 'profile.info.toggle'
    | 'profile.info.nights'
    | 'profile.info.departure'
    | 'profile.info.nights_unit'
    | 'profile.info.not_set'
    | 'profile.info.day_trip'
    | 'profile.info.details_btn'
    | 'profile.info.city_placeholder'
    | 'login.error.failed'
    | 'register.placeholder.gender'
    | 'register.placeholder.address_pref'
    | 'register.placeholder.address_city'
    | 'register.placeholder.indoor_outdoor'
    | 'register.error.failed'
    | 'preview.shorts.title'
    | 'preview.shorts.loading'
    | 'preview.shorts.empty'
    | 'preview.pictures.title'
    | 'preview.pictures.login_required'
    | 'preview.pictures.loading'
    | 'preview.pictures.generate_btn'
    | 'preview.pictures.error.failed'
    | 'preview.pictures.error.general'
    | 'preview.video.title'
    | 'preview.video.login_required'
    | 'preview.video.loading'
    | 'preview.video.generate_btn'
    | 'preview.video.error.failed'
    | 'preview.video.error.general'
    | 'data.region.hokkaido'
    | 'data.region.tohoku'
    | 'data.region.kanto'
    | 'data.region.chubu'
    | 'data.region.kinki'
    | 'data.region.chugoku'
    | 'data.region.shikoku'
    | 'data.region.kyushu_okinawa'
    | 'common.prefecture'
    | 'common.city'
    | 'footer.copyright';

export const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        'app.title': 'Future Memories',
        'login': 'Login',
        'login.title': 'Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.placeholder.username': 'Alphanumeric only',
        'login.btn': 'Login',
        'login.no_account': "Don't have an account?",
        'login.register_link': 'Register',
        'login.loading': 'Logging in...',
        'register.title': 'Create Account',
        'register.username': 'Username *',
        'register.password': 'Password *',
        'register.display_name': 'Display Name (Nickname)',
        'register.age': 'Age',
        'register.gender': 'Gender',
        'register.address': 'Address (Prefecture/City)',
        'register.indoor_outdoor': 'Indoor / Outdoor',
        'register.hobbies': 'Hobbies (Press Enter to add)',
        'register.btn': 'Create Account',
        'register.have_account': 'Already have an account?',
        'register.login_link': 'Login',
        'register.loading': 'Registering...',
        'register.placeholder.username': 'Alphanumeric only',
        'register.placeholder.display_name': 'Optional',
        'register.placeholder.hobbies': 'e.g. Photography, Food, Soccer',
        'account.title': 'My Profile',
        'account.logout': 'Logout',
        'account.edit_btn': 'Edit Profile',
        'account.tab.profile': 'Profile',
        'account.tab.shared': 'Shared Plans',
        'account.tab.mylist': 'My List',
        'account.mylist.title': 'Saved Plans',
        'account.shared.title': 'Shared Plans',
        'account.no_mylist': 'No saved plans yet. Discover them in Social Mode!',
        'account.no_shared': 'No shared plans yet.',
        'account.delete_confirm': 'Are you sure you want to remove this plan from your favorites?',
        'account.delete_shared_confirm': 'Are you sure you want to delete this shared plan? (It will be removed from public view)',
        'account.update_success': 'Profile updated successfully!',
        'account.update_error': 'Failed to update profile.',
        'account.profile_image': 'Profile Image',
        'account.gender.male': 'Male',
        'account.gender.female': 'Female',
        'account.gender.other': 'Other',
        'account.gender.no_answer': 'Prefer not to say',
        'account.type.indoor': 'Indoor person',
        'account.type.outdoor': 'Outdoor person',
        'account.type.both': 'Both',
        'account.save_btn': 'Save Changes',
        'account.cancel_btn': 'Cancel',
        'account.saving': 'Saving...',
        'itinerary.login_required': 'Login required for this action.',
        'itinerary.edit.btn': 'Edit',
        'itinerary.edit.done': 'Done',
        'itinerary.edit.add': 'Add Item Here',
        'itinerary.edit.add_end': 'Add Item at End',
        'itinerary.new_activity': 'New Activity',
        'itinerary.share': 'Share Plan',
        'itinerary.share_confirm': 'Are you sure you want to share this plan publicly?',
        'itinerary.status.save': 'Save to My List',
        'itinerary.concierge': 'Consult AI Concierge',
        'itinerary.favorite_success': 'Saved to My List!',
        'itinerary.favorite_duplicate': 'Already in My List.',
        'itinerary.favorite_updated': 'Updated in My List!',
        'itinerary.sharing': 'Sharing...',
        'itinerary.saving': 'Saving...',
        'itinerary.edit': 'Edit',
        'itinerary.done': 'Done',
        'itinerary.share_success': 'Plan shared successfully!',
        'itinerary.share_duplicate': 'Plan is already shared.',
        'itinerary.share_updated': 'Shared plan updated!',
        'itinerary.share_error': 'Failed to share plan.',
        'itinerary.save_success': 'Saved to My List!',
        'itinerary.save_duplicate': 'Already in My List.',
        'itinerary.save_updated': 'Updated in My List!',
        'itinerary.save_error': 'Failed to save plan.',
        'itinerary.delete_confirm': 'Are you sure you want to delete this item?',
        'social.details_btn': '⚙️ Details',
        'social.keyword_label': 'Search Keyword',
        'home.hero.title1': 'Design Your',
        'home.hero.title2': 'Future Memories',
        'home.hero.desc': 'AI-powered travel planning that starts with a feeling. See your journey before you take the first step.',
        'home.mode.personal.title': 'Personal Mode',
        'home.mode.personal.desc': 'AI creates a unique journey just for you.',
        'home.mode.social.title': 'Social Mode',
        'home.mode.social.desc': 'Discover and relive journeys from others.',
        'home.cta': 'Start Experience',
        'feature.personalized.title': 'Personalized',
        'feature.personalized.desc': 'Travel designed around your unique personality.',
        'feature.visual.title': 'Visual',
        'feature.visual.desc': 'Preview your trip with cinematic AI-generated videos.',
        'feature.emotional.title': 'Emotional',
        'feature.emotional.desc': 'Choose your destination based on how it makes you feel.',
        'profile.title': "What's your Travel Style?",
        'profile.subtitle': 'Select the mode that best describes your ideal trip.',
        'profile.btn': 'Generate Proposals',
        'profile.mode.senior.title': 'Relaxed Senior',
        'profile.mode.senior.desc': 'Safe, barrier-free, avoids slopes, ample breaks, relaxed pace.',
        'profile.mode.solo.title': 'Solo Traveler',
        'profile.mode.solo.desc': 'Immersive, solo-friendly shops, quiet spots, safe, flexible itinerary.',
        'profile.mode.family.title': 'Fun Family',
        'profile.mode.family.desc': 'Kids first, stroller access, diaper rooms, play areas, hands-on activities.',
        'profile.mode.influencer.title': 'Trend & Photo',
        'profile.mode.influencer.desc': 'Photogenic views, trending sweets, safe and stylish spots.',
        'profile.mode.active.title': 'Active Explorer',
        'profile.mode.active.desc': 'Discovery oriented, lots of walking, hidden gems, efficient early-bird routing.',
        'profile.tags.title': 'Interests (Multiple selection allowed)',
        'profile.attributes.title': 'Custom Preferences',
        'profile.attributes.placeholder': 'e.g. Vegetarian diet, Traveling with pets, Prefer quiet hotels...',
        'proposal.title': 'AI Proposals for',
        'proposal.desc': 'Based on your profile, we have crafted 3 unique experiences.',
        'proposal.match': 'Match',
        'proposal.watch': 'Watch Preview',
        'proposal.loading.title': 'Dreaming up your journey...',
        'proposal.loading.desc': 'AI is crafting unique experiences for travelers.',
        'preview.back': 'Back',
        'preview.playing': 'Previewing',
        'preview.select': 'Select This Journey',
        'preview.no_videos': 'No videos found for this plan.',
        'social.title': 'Social Mode',
        'social.desc': 'Discover journeys created by others.',
        'social.placeholder': 'Search places or themes (e.g. Kyoto, History...)',
        'social.searching': 'Searching...',
        'social.search_btn': 'Search',
        'social.results': 'Search Results',
        'social.no_results': 'No results found. Try a different query.',
        'common.by': 'By',
        'itinerary.title': 'Your Information',
        'itinerary.subtitle': 'A perfectly paced day for a relaxed explorer.',
        'itinerary.schedule': 'Schedule',
        'itinerary.souvenir': 'Souvenir Concierge',
        'itinerary.souvenir.desc': 'Recommended based on your preferences.',
        'itinerary.loading.title': 'Mapping out the details...',
        'itinerary.loading.desc': 'Calculating optimal routes and hidden gems.',
        'profile.info.toggle': 'Use Profile Info',
        'profile.info.nights': 'Nights',
        'profile.info.departure': 'Departure Point',
        'profile.info.nights_unit': 'Nights',
        'profile.info.not_set': 'Not set',
        'profile.info.day_trip': 'Day trip',
        'profile.info.details_btn': '⚙️ Details',
        'profile.info.city_placeholder': 'Select City...',
        'login.error.failed': 'Login failed. Please check your credentials.',
        'register.placeholder.gender': 'Select Gender',
        'register.placeholder.address_pref': 'Prefecture',
        'register.placeholder.address_city': 'City',
        'register.placeholder.indoor_outdoor': 'Preference',
        'register.error.failed': 'Registration failed. Please try again.',
        'preview.shorts.title': 'Reference Short Videos',
        'preview.shorts.loading': 'Searching for related videos...',
        'preview.shorts.empty': 'No related videos found.',
        'preview.pictures.title': 'Photos of Your Journey',
        'preview.pictures.login_required': 'Login to generate personalized photos using your profile image.',
        'preview.pictures.loading': 'Generating 3 photos...',
        'preview.pictures.generate_btn': 'Generate Photos',
        'preview.pictures.error.failed': 'Failed to generate images.',
        'preview.pictures.error.general': 'An error occurred during image generation.',
        'preview.video.title': 'AI Video of Your Journey',
        'preview.video.login_required': 'Login to generate an AI video.',
        'preview.video.loading': 'Generating video... (takes about 1 minute)',
        'preview.video.generate_btn': 'Generate Video',
        'preview.video.error.failed': 'Failed to generate video.',
        'preview.video.error.general': 'An error occurred during video generation.',
        'data.region.hokkaido': 'Hokkaido',
        'data.region.tohoku': 'Tohoku',
        'data.region.kanto': 'Kanto',
        'data.region.chubu': 'Chubu',
        'data.region.kinki': 'Kinki',
        'data.region.chugoku': 'Chugoku',
        'data.region.shikoku': 'Shikoku',
        'data.region.kyushu_okinawa': 'Kyushu & Okinawa',
        'common.prefecture': 'Prefecture',
        'common.city': 'City',
        'footer.copyright': 'AI Travel Experience Designer. All rights reserved.'
    },
    ja: {
        'app.title': 'Future Memories',
        'login': 'ログイン',
        'login.title': 'ログイン',
        'login.username': 'ユーザー名',
        'login.password': 'パスワード',
        'login.placeholder.username': '半角英数字',
        'login.btn': 'ログイン',
        'login.no_account': 'アカウントをお持ちでないですか？',
        'login.register_link': '新規登録',
        'login.loading': 'ログイン中...',
        'register.title': 'アカウント登録',
        'register.username': 'ユーザー名 *',
        'register.password': 'パスワード *',
        'register.display_name': '表示名 (ニックネーム)',
        'register.age': '年齢',
        'register.gender': '性別',
        'register.address': '住所 (都道府県・市区町村)',
        'register.indoor_outdoor': 'インドア / アウトドア',
        'register.hobbies': '趣味・嗜好 (Enterで追加)',
        'register.btn': 'アカウント作成',
        'register.have_account': 'すでにアカウントをお持ちですか？',
        'register.login_link': 'ログイン',
        'register.loading': '登録処理中...',
        'register.placeholder.username': '半角英数字',
        'register.placeholder.display_name': '（任意）',
        'register.placeholder.hobbies': '例: 写真, カフェ, サッカー',
        'account.title': 'マイプロフィール',
        'account.logout': 'ログアウト',
        'account.edit_btn': 'Edit Profile',
        'account.tab.profile': 'プロフィール',
        'account.tab.shared': '共有済みプラン',
        'account.tab.mylist': 'My List',
        'account.mylist.title': '保存したプラン',
        'account.shared.title': '共有したプラン',
        'account.no_mylist': 'まだ保存されたプランはありません。Social Modeでプランを探してみましょう！',
        'account.no_shared': 'まだ共有したプランはありません。',
        'account.delete_confirm': 'このプランをお気に入りから削除しますか？',
        'account.delete_shared_confirm': 'この共有プランを削除しますか？（パブリックからも削除されます）',
        'account.update_success': 'プロフィールを更新しました！',
        'account.update_error': 'プロフィールの更新に失敗しました。',
        'account.profile_image': 'プロフィール画像',
        'account.gender.male': '男性',
        'account.gender.female': '女性',
        'account.gender.other': 'その他',
        'account.gender.no_answer': '回答しない',
        'account.type.indoor': 'インドア派',
        'account.type.outdoor': 'アウトドア派',
        'account.type.both': 'どちらも',
        'account.save_btn': '変更を保存',
        'account.cancel_btn': 'キャンセル',
        'account.saving': '保存中...',
        'itinerary.login_required': 'この操作にはログインが必要です。',
        'itinerary.edit.btn': '編集',
        'itinerary.edit.done': '完了',
        'itinerary.edit.add': 'ここに追加',
        'itinerary.edit.add_end': '最後に追加',
        'itinerary.new_activity': '新しいアクティビティ',
        'itinerary.share': 'シェアする',
        'itinerary.share_confirm': 'このプランを公開してシェアしますか？',
        'itinerary.status.save': 'My List に保存',
        'itinerary.concierge': 'AIコンシェルジュに相談',
        'itinerary.favorite_success': 'My Listに保存しました！',
        'itinerary.favorite_duplicate': 'すでにMy Listに登録済みです。',
        'itinerary.favorite_updated': 'My Listのプランを更新しました！',
        'itinerary.sharing': 'シェア中...',
        'itinerary.saving': '保存中...',
        'itinerary.edit': '編集',
        'itinerary.done': '完了',
        'itinerary.share_success': 'プランをシェアしました！',
        'itinerary.share_duplicate': 'すでにシェア済みのプランです。',
        'itinerary.share_updated': 'プランを更新しました！',
        'itinerary.share_error': 'シェアに失敗しました。',
        'itinerary.save_success': 'My Listに保存しました！',
        'itinerary.save_duplicate': 'すでにMy Listに登録済みです。',
        'itinerary.save_updated': 'My Listのプランを更新しました！',
        'itinerary.save_error': '保存に失敗しました。',
        'itinerary.delete_confirm': '項目を削除しますか？',
        'social.details_btn': '⚙️ 詳細条件',
        'social.keyword_label': '検索キーワード',
        'home.hero.title1': '旅の記憶を',
        'home.hero.title2': 'デザインする',
        'home.hero.desc': '「感情」から始まるAI旅行計画。最初の一歩を踏み出す前に、未来の旅を体験しましょう。',
        'home.mode.personal.title': 'パーソナルモード',
        'home.mode.personal.desc': 'AIがあなただけの特別な旅を創造します。',
        'home.mode.social.title': 'ソーシャルモード',
        'home.mode.social.desc': '他の旅行者の体験を見つけ、追体験しましょう。',
        'home.cta': '体験を始める',
        'feature.personalized.title': 'パーソナライズ',
        'feature.personalized.desc': 'あなたの個性に寄り添う、あなただけの旅のデザイン。',
        'feature.visual.title': 'ビジュアル',
        'feature.visual.desc': '映画のようなAI生成プレビュー動画で、旅の空気感を事前に体験。',
        'feature.emotional.title': 'エモーショナル',
        'feature.emotional.desc': '場所の情報ではなく、「どう感じるか」という感情で旅を選ぶ。',
        'profile.title': 'あなたの旅のスタイルは？',
        'profile.subtitle': '理想の旅に最も近いモードを選んでください。',
        'profile.btn': 'プランを生成する',
        'profile.mode.senior.title': 'のんびりシニア',
        'profile.mode.senior.desc': '【安心・バリアフリー】坂道回避、休憩確保、ゆったり旅程。',
        'profile.mode.solo.title': '自由気ままな一人旅',
        'profile.mode.solo.desc': '【没入・カウンター】1人でも入りやすい店、静かなスポット、柔軟な行程。',
        'profile.mode.family.title': 'わんぱくファミリー',
        'profile.mode.family.desc': '【子供優先・設備】ベビーカー対応、おむつ替え室、体験型施設。',
        'profile.mode.influencer.title': '映え追求！女子旅',
        'profile.mode.influencer.desc': '【写真・トレンド】フォトジェニックな景観、話題のスイーツ、治安の良さ。',
        'profile.mode.active.title': '健脚アクティブ',
        'profile.mode.active.desc': '【発見・運動量】徒歩移動多め、隠れた名所、効率的な周遊。',
        'profile.tags.title': '興味・関心（複数選択可）',
        'profile.attributes.title': '追加のこだわり条件',
        'profile.attributes.placeholder': '例：ベジタリアン、ペット同伴、静かなホテル希望...',
        'proposal.title': 'ご提案：',
        'proposal.desc': 'あなたのプロファイルに基づき、3つの特別な体験をご用意しました。',
        'proposal.match': 'マッチ度',
        'proposal.watch': 'プレビューを見る',
        'proposal.loading.title': '旅を構想中...',
        'proposal.loading.desc': 'AIがあなただけの特別な体験を創造しています。',
        'preview.back': '戻る',
        'preview.playing': '再生中',
        'preview.select': 'この旅にする',
        'preview.no_videos': 'このプランに合う動画が見つかりませんでした。',
        'social.title': 'ソーシャルモード',
        'social.desc': '他の旅行者の体験を見つけ、追体験しましょう。',
        'social.placeholder': '場所やテーマで検索（例：京都、歴史...）',
        'social.searching': '検索中...',
        'social.search_btn': '検索',
        'social.results': '検索結果',
        'social.no_results': '結果が見つかりませんでした。別のキーワードを試してください。',
        'common.by': '投稿者：',
        'itinerary.title': '旅のしおり',
        'itinerary.subtitle': 'ゆったりとした探索を楽しむ、完璧な一日。',
        'itinerary.schedule': 'スケジュール',
        'itinerary.souvenir': 'お土産コンシェルジュ',
        'itinerary.souvenir.desc': 'あなたの好みに合わせたおすすめアイテム。',
        'itinerary.loading.title': '詳細を計画中...',
        'itinerary.loading.desc': '最適なルートと隠れた名所を計算しています。',
        'profile.info.toggle': 'プロフィール情報を利用する',
        'profile.info.nights': '宿泊数',
        'profile.info.departure': '出発地',
        'profile.info.nights_unit': '泊',
        'profile.info.not_set': '未設定',
        'profile.info.day_trip': '日帰り',
        'profile.info.details_btn': '⚙️ 詳細条件',
        'profile.info.city_placeholder': '市区町村を選択...',
        'login.error.failed': 'ログインに失敗しました。認証情報を確認してください。',
        'register.placeholder.gender': '性別を選択',
        'register.placeholder.address_pref': '都道府県',
        'register.placeholder.address_city': '市',
        'register.placeholder.indoor_outdoor': 'インドア/アウトドア',
        'register.error.failed': '登録に失敗しました。もう一度お試しください。',
        'preview.shorts.title': '参考ショート動画',
        'preview.shorts.loading': '関連動画を検索中...',
        'preview.shorts.empty': '関連動画が見つかりませんでした。',
        'preview.pictures.title': 'あなたの旅の様子（Pictures）',
        'preview.pictures.login_required': 'ログインすると、あなたのプロフィール画像を使って旅の写真を生成できます。',
        'preview.pictures.loading': '2枚の画像を生成中...',
        'preview.pictures.generate_btn': '写真を生成する',
        'preview.pictures.error.failed': '画像の生成に失敗しました。',
        'preview.pictures.error.general': '画像の生成中にエラーが発生しました。',
        'preview.video.title': 'あなたの旅の様子（Video）',
        'preview.video.login_required': 'ログインすると、AI動画を生成できます。',
        'preview.video.loading': '動画を生成中... (1分ほどかかります)',
        'preview.video.generate_btn': '動画を生成する',
        'preview.video.error.failed': '動画の生成に失敗しました。',
        'preview.video.error.general': '動画の生成中にエラーが発生しました。',
        'data.region.hokkaido': '北海道',
        'data.region.tohoku': '東北',
        'data.region.kanto': '関東',
        'data.region.chubu': '中部',
        'data.region.kinki': '近畿',
        'data.region.chugoku': '中国',
        'data.region.shikoku': '四国',
        'data.region.kyushu_okinawa': '九州・沖縄',
        'common.prefecture': '都道府県',
        'common.city': '市',
        'footer.copyright': 'AI Travel Experience Designer. All rights reserved.'
    }
};
