/**
 * @author dean
 * @explain Promise custom
 */
interface Promise<T> {
    catch<TResult = never>(
        // Promise catch전달
        onrejected?: (reason: any) => TResult | PromiseLike<TResult>
    ): Promise<T | TResult>;

    // ex
    someHandler<TSome = never>(
        onSome?: (params?: any) => void
    )
}
